export const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    type = 'button',
    fullWidth = false,
    sx = {},
    ...props
}) => {
    const baseStyles = {
        borderRadius: 1.5,
        fontWeight: 700,
        textTransform: 'none',
        transition: 'all 0.15s',
        ...(fullWidth && { width: '100%' })
    };

    const variants = {
        primary: {
            background: '#FFD600',
            color: '#111827',
            border: 'none',
            '&:hover': { background: '#e6c200' },
            '&.Mui-disabled': { background: '#f3f4f6', color: '#9ca3af' }
        },
        secondary: {
            background: '#ffffff',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            '&:hover': { background: '#f3f4f6', borderColor: '#d1d5db' }
        },
        text: {
            background: 'transparent',
            color: '#6b7280',
            border: 'none',
            '&:hover': { background: '#f3f4f6' }
        }
    };

    const sizes = {
        small: { padding: '6px 14px', fontSize: 12 },
        medium: { padding: '8px 16px', fontSize: 14 },
        large: { padding: '10px 20px', fontSize: 16 }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                ...baseStyles,
                ...variants[variant],
                ...sizes[size],
                cursor: disabled ? 'not-allowed' : 'pointer',
                ...sx
            }}
            {...props}
        >
            {children}
        </button>
    );
};
