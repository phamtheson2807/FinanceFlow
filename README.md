# 💸 Welcome to FinanceFlow

```go
package main

import (
	"fmt"
)

// Project mô phỏng thông tin về dự án FinanceFlow
type Project struct {
	Name         string
	Description  string
	Goals        []string
	Features     []string
	Technologies map[string]string
}

func (p *Project) Init() {
	p.Name = "FinanceFlow"
	p.Description = "Ứng dụng giúp quản lý tài chính cá nhân hiệu quả và trực quan."
	p.Goals = []string{
		"Theo dõi thu nhập và chi tiêu",
		"Tạo thói quen tài chính lành mạnh",
		"Trực quan hóa dữ liệu tài chính",
	}
	p.Features = []string{
		"Thống kê thu chi theo thời gian",
		"Phân loại giao dịch",
		"Biểu đồ trực quan",
		"Xuất báo cáo Excel",
		"Xác thực bảo mật bằng JWT",
	}
	p.Technologies = map[string]string{
		"Frontend":      "React.js, TypeScript, Tailwind CSS",
		"Backend":       "Node.js, Express.js",
		"Database":      "MongoDB",
		"Authentication": "JWT, Refresh Token",
		"Export":        "SheetJS (xlsx)",
	}
}

func PrintProjectInfo(p *Project) {
	fmt.Printf("🚀 Dự án: %s\n", p.Name)
	fmt.Println("📝 Mô tả:", p.Description)

	fmt.Println("\n🎯 Mục tiêu:")
	for _, goal := range p.Goals {
		fmt.Println("- ", goal)
	}

	fmt.Println("\n🔧 Tính năng:")
	for _, f := range p.Features {
		fmt.Println("- ", f)
	}

	fmt.Println("\n🛠️ Công nghệ sử dụng:")
	for k, v := range p.Technologies {
		fmt.Printf("- %s: %s\n", k, v)
	}
}

func main() {
	app := &Project{}
	app.Init()
	PrintProjectInfo(app)
}
```
