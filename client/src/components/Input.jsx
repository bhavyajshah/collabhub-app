import { TextField } from '@mui/material';

export const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error = false,
  fullWidth = true,
  multiline = false,
  rows = 1,
  sx = {},
  ...props
}) => {
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      color: '#111827',
      backgroundColor: '#f9fafb',
      fontSize: 13,
      '& fieldset': { borderColor: error ? '#dc2626' : '#e5e7eb' },
      '&:hover fieldset': { borderColor: error ? '#dc2626' : '#d1d5db' },
      '&.Mui-focused fieldset': { borderColor: error ? '#dc2626' : '#FFD600', borderWidth: 1.5 }
    },
    '& .MuiInputLabel-root': { color: error ? '#dc2626' : '#9ca3af', fontSize: 13 },
    '& .MuiInputLabel-root.Mui-focused': { color: error ? '#dc2626' : '#111827' },
    ...sx
  };

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={type}
      fullWidth={fullWidth}
      multiline={multiline}
      rows={rows}
      size="small"
      sx={inputSx}
      {...props}
    />
  );
};
