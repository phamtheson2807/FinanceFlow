package main

import (
	"fmt"
)

// Github định nghĩa thông tin về tác giả của dự án FinanceFlow
type Github struct {
	Username       string
	Contacts       map[string]string
	Aliases        []string
	Location       string
	Age            string
	Occupation     string
	OperatingSystem string
}

// Init khởi tạo thông tin cho đối tượng Github
func (g *Github) Init() {
	g.Username = "phamtheson2807"
	g.Contacts = map[string]string{
		"Discord":  "#", // Cập nhật sau
		"Facebook": "PhamTheSon.User",
	}
	g.Aliases = []string{"thesondev", "Tdv"}
	g.Location = "localhost, Việt Nam"
	g.Age = "21+"
	g.Occupation = "Freelance Developer"
	g.OperatingSystem = "Windows, Arch Linux, VPS"
}

// WelcomeMessage hiển thị thông điệp chào mừng cho FinanceFlow
func WelcomeMessage(g *Github) string {
	return fmt.Sprintf(`
Chào Mừng Đến Với FinanceFlow

FinanceFlow là một dự án quản lý tài chính cá nhân được phát triển bởi %s.
Thông tin về tác giả:
- Tên tài khoản GitHub: %s
- Liên hệ:
  - Discord: %s
  - Facebook: %s
- Biệt danh: %v
- Vị trí: %s
- Tuổi: %s
- Nghề nghiệp: %s
- Hệ điều hành sử dụng: %s

Mục tiêu của FinanceFlow:
- Theo dõi thu nhập và chi tiêu.
- Giao diện thân thiện, dễ sử dụng.
- Trực quan hóa dữ liệu tài chính qua biểu đồ và bảng biểu.

Hãy cùng xây dựng một công cụ tài chính tuyệt vời!
Xem thêm tại: https://github.com/phamtheson2807/FinanceFlow
`, g.Username, g.Username, g.Contacts["Discord"], g.Contacts["Facebook"], g.Aliases, g.Location, g.Age, g.Occupation, g.OperatingSystem)
}

func main() {
	// Khởi tạo thông tin tác giả
	author := &Github{}
	author.Init()

	// In thông điệp chào mừng
	fmt.Println(WelcomeMessage(author))
}
