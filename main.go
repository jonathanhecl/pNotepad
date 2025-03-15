package main

import (
	"embed"
	"flag"
	"os"
	"runtime"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

var (
	version  string = "1.0.1"
	filename string
)

func main() {
	flag.StringVar(&filename, "file", "notes.stxt", "Path to the notes file")
	flag.Parse()

	// Check command line arguments for file path in Windows
	if runtime.GOOS == "windows" && len(os.Args) > 1 && os.Args[1] != "-file" {
		filename = os.Args[1]
	}

	// Create an instance of the app structure
	app := NewApp()

	app.Filename = filename
	app.Version = version

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "pNotepad (" + filename + ")",
		Width:  1024,
		Height: 768,
		Mac: &mac.Options{
			OnFileOpen: func(filePath string) {
				app.Filename = filePath
				_, _ = app.TryLoad()
			},
		},
		Windows: &windows.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
		},
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: "e3984e08-28dc-4e3d-b70a-45e961589cdc",
		},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
