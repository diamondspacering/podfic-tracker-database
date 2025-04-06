import { TextField } from '@mui/material';
import React from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

// NOTE: this is not currently being used anywhere because of the Difficulties with numbers
const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, name, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: name,
              value: values.value,
            },
          });
        }}
        thousandSeparator
        valueIsNumericString
      />
    );
  }
);

export default function FormattedNumberField({
  value,
  onChange,
  slotProps = {},
  ...rest
}) {
  return (
    <div>
      <TextField
        {...rest}
        type='number'
        value={value}
        onChange={onChange}
        id='formatted-number-input'
        slotProps={{
          ...slotProps,
          input: {
            inputComponent: NumericFormatCustom as any,
          },
        }}
      />
    </div>
  );
}
