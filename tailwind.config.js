/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'calc(var(--radius) + 2px)',
  			'2xl': 'calc(var(--radius) + 4px)',
  			'3xl': 'calc(var(--radius) + 8px)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  			'fade-out': 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  			'slide-in-from-top': 'slideInFromTop 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  			'slide-in-from-bottom': 'slideInFromBottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  			'slide-in-from-left': 'slideInFromLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  			'slide-in-from-right': 'slideInFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  			'zoom-in': 'zoomIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  			'zoom-out': 'zoomOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  			'bounce-soft': 'bounceSoft 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  			'float': 'float 4s ease-in-out infinite',
  			'pulse-soft': 'pulseSoft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'shimmer': 'shimmer 2s linear infinite',
  			'glow': 'glow 2s ease-in-out infinite alternate'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(30px) scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0) scale(1)'
  				}
  			},
  			fadeOut: {
  				'0%': {
  					opacity: '1',
  					transform: 'translateY(0) scale(1)'
  				},
  				'100%': {
  					opacity: '0',
  					transform: 'translateY(30px) scale(0.95)'
  				}
  			},
  			slideInFromTop: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-30px) scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0) scale(1)'
  				}
  			},
  			slideInFromBottom: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(30px) scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0) scale(1)'
  				}
  			},
  			slideInFromLeft: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-30px) scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0) scale(1)'
  				}
  			},
  			slideInFromRight: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(30px) scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0) scale(1)'
  				}
  			},
  			zoomIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.85)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			zoomOut: {
  				'0%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				},
  				'100%': {
  					opacity: '0',
  					transform: 'scale(0.85)'
  				}
  			},
  			bounceSoft: {
  				'0%, 20%, 53%, 80%, 100%': {
  					transform: 'translate3d(0, 0, 0)'
  				},
  				'40%, 43%': {
  					transform: 'translate3d(0, -12px, 0)'
  				},
  				'70%': {
  					transform: 'translate3d(0, -6px, 0)'
  				},
  				'90%': {
  					transform: 'translate3d(0, -3px, 0)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px) rotate(0deg)'
  				},
  				'25%': {
  					transform: 'translateY(-15px) rotate(1deg)'
  				},
  				'50%': {
  					transform: 'translateY(-20px) rotate(0deg)'
  				},
  				'75%': {
  					transform: 'translateY(-15px) rotate(-1deg)'
  				}
  			},
  			pulseSoft: {
  				'0%, 100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				},
  				'50%': {
  					opacity: '0.7',
  					transform: 'scale(1.05)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-200% 0'
  				},
  				'100%': {
  					backgroundPosition: '200% 0'
  				}
  			},
  			glow: {
  				'from': {
  					boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
  				},
  				'to': {
  					boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)'
  				}
  			}
  		},
  		spacing: {
  			'sidebar-width': 'var(--sidebar-width)',
  			'header-height': 'var(--header-height)'
  		},
  		boxShadow: {
  			'soft': '0 4px 25px -3px rgba(139, 92, 246, 0.15), 0 15px 35px -2px rgba(139, 92, 246, 0.08)',
  			'glow': '0 0 30px rgba(139, 92, 246, 0.2), 0 0 60px rgba(139, 92, 246, 0.1)',
  			'glow-success': '0 0 30px rgba(34, 197, 94, 0.2), 0 0 60px rgba(34, 197, 94, 0.1)',
  			'glow-warning': '0 0 30px rgba(245, 158, 11, 0.2), 0 0 60px rgba(245, 158, 11, 0.1)',
  			'glow-info': '0 0 30px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.1)'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		transitionTimingFunction: {
  			'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  			'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)',
  				'Plus Jakarta Sans',
  				'sans-serif'
  			],
  			serif: [
  				'var(--font-serif)',
  				'Lora',
  				'serif'
  			],
  			mono: [
  				'var(--font-mono)',
  				'Roboto Mono',
  				'monospace'
  			]
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'gradient-pastel': 'linear-gradient(135deg, hsl(250, 100%, 97%) 0%, hsl(220, 14%, 98%) 25%, hsl(250, 100%, 98%) 50%, hsl(220, 14%, 99%) 75%, hsl(250, 100%, 99%) 100%)',
  			'gradient-primary-soft': 'linear-gradient(135deg, hsl(250, 100%, 90%) 0%, hsl(250, 100%, 95%) 50%, hsl(250, 100%, 98%) 100%)',
  			'gradient-success-soft': 'linear-gradient(135deg, hsl(142, 76%, 92%) 0%, hsl(142, 76%, 96%) 50%, hsl(142, 76%, 98%) 100%)',
  			'gradient-warning-soft': 'linear-gradient(135deg, hsl(38, 92%, 92%) 0%, hsl(38, 92%, 96%) 50%, hsl(38, 92%, 98%) 100%)',
  			'gradient-info-soft': 'linear-gradient(135deg, hsl(199, 89%, 92%) 0%, hsl(199, 89%, 96%) 50%, hsl(199, 89%, 98%) 100%)',
  			'gradient-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
  			'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  			'gradient-glass-dark': 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)'
  		}
  	}
  },
  plugins: [],
}
