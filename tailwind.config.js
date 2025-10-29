/** @type {import('tailwindcss').Config} */
export default {
  // This section tells Tailwind to scan all the specified files
  // for any utility classes you use, so it can generate the necessary CSS.
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  
  // This is where you customize Tailwind's default design system.
  theme: {
    // The 'extend' key allows you to add new values without overwriting the defaults.
    extend: {
      // Add your custom brand colors here.
      // You can now use classes like `bg-strive-blue` or `text-strive-orange`.
      colors: {
        'strive-blue': '#005A9E', 
        'strive-orange': '#F47B20',
        'strive-green': '#28A745',
      },
      // Set the default font for the entire application.
      // The 'sans' key targets the default sans-serif font stack.
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  
  // This is where you would add any official or third-party Tailwind plugins.
  // For now, we don't have any.
  plugins: [],
}

