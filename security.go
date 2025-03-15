package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"errors"

	"golang.org/x/crypto/pbkdf2"
)

// Constantes de seguridad
const (
	KeyLength  = 32
	NonceSize  = 12
	SaltSize   = 16
	Iterations = 100_000
)

// encrypt encrypts data with a password using AES-GCM with PBKDF2 key derivation.
func encrypt(data []byte, password string) ([]byte, error) {
	// Generar una sal aleatoria para PBKDF2
	salt := make([]byte, SaltSize)
	if _, err := rand.Read(salt); err != nil {
		return nil, err
	}

	// Derivar la clave con PBKDF2
	key := pbkdf2.Key([]byte(password), salt, Iterations, KeyLength, sha256.New)

	// Crear el cifrador AES
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	// Crear el modo GCM
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	// Generar un nonce aleatorio
	nonce := make([]byte, NonceSize)
	if _, err := rand.Read(nonce); err != nil {
		return nil, err
	}

	// Cifrar los datos
	ciphertext := gcm.Seal(nil, nonce, data, nil)

	// Construir la salida con salt + nonce + ciphertext
	finalData := append(salt, nonce...)
	finalData = append(finalData, ciphertext...)

	// Retornar la cadena codificada
	return finalData, nil
}

// decrypt decrypts AES-GCM encrypted data with a password using PBKDF2 key derivation.
func decrypt(encrypted []byte, password string) ([]byte, error) {
	// Extraer salt, nonce y ciphertext
	if len(encrypted) < SaltSize+NonceSize {
		return nil, errors.New("data too short")
	}

	salt := encrypted[:SaltSize]
	nonce := encrypted[SaltSize : SaltSize+NonceSize]
	ciphertext := encrypted[SaltSize+NonceSize:]

	// Derivar la clave con PBKDF2
	key := pbkdf2.Key([]byte(password), salt, Iterations, KeyLength, sha256.New)

	// Crear el cifrador AES
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	// Crear GCM
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	// Descifrar
	plainText, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, errors.New("decryption failed")
	}

	return plainText, nil
}
