package main

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"log"
	"os"
)

var (
	headerEncrypted = []byte("pN\x00\x00\x01")
)

// App struct
type App struct {
	ctx      context.Context
	Filename string
	Version  string
	Password string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) UnlockFile(password string) string {
	a.Password = password
	content, err := a.TryLoad()
	if err != nil {
		return err.Error()
	}

	return ";" + content
}

func (a *App) GetVersion() string {
	return a.Version
}

func (a *App) SaveFile(content, password string) error {
	if password == "" {
		password = a.Password
	}
	var encrypted []byte
	if a.Password != "" {
		encrypted = headerEncrypted
		encryptedData, err := encrypt([]byte(content), password)
		if err != nil {
			return err
		}
		encrypted = append(encrypted, encryptedData...)
	} else {
		encrypted = []byte(content)
	}

	err := os.WriteFile(a.Filename, encrypted, 0644)
	if err != nil {
		return err
	}

	return nil
}

func (a *App) TryLoad() (string, error) {
	if _, err := os.Stat(a.Filename); os.IsNotExist(err) {
		file, err := os.Create(a.Filename)
		if err != nil {
			log.Fatalf("Failed to create file: %v", err)
			return "", err
		}
		file.Close()

		return "", nil
	}

	var content string = ""

	data, err := os.ReadFile(a.Filename)
	if err != nil {
		return "", err
	}

	if bytes.Equal(data[:5], headerEncrypted) {
		if a.Password == "" {
			return "", errors.New("Invalid password")
		}

		data = data[5:]

		decrypted, err := decrypt(data, a.Password)
		if err != nil {
			fmt.Println("Error decrypting file:", err)
			return "", err
		}

		content = string(decrypted)
	} else {
		content = string(data)
	}

	return content, nil
}
