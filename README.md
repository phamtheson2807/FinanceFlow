package main

import (
    "fmt"
)

// Github định nghĩa thông tin tác giả của dự án FinanceFlow
type Github struct {
    Username         string
    Contacts         map[string]string
    Aliases          []string
    Location         string
    Age              string
    Occupation       string
    OperatingSystem  string
}

func (g *Github) Init() {
    g.Username = "phamtheson2807"
    g.Contacts = map[string]string{
        "Discord":  "#",
        "Facebook": "PhamTheSon.User",
    }
    g.Aliases = []string{"thesondev", "Tdv"}
    g.Location = "localhost, Việt Nam"
    g.Age = "21+"
    g.Occupation = "Freelance Developer"
    g.OperatingSystem = "Windows, Arch Linux, VPS"
}

func main() {
    dev := &Github{}
    dev.Init()

    fmt.Println("🚀 Welcome to FinanceFlow")
    fmt.Printf("👨‍💻 Built with love by @%s\n", dev.Username)
}
