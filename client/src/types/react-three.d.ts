import '@react-three/fiber';

declare module '@react-three/fiber' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      cylinderGeometry: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      directionalLight: any;
      [key: string]: any; // Để linh hoạt hơn nếu cần thêm thành phần khác
    }
  }
}