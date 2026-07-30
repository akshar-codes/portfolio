import { Controller, useFormContext } from "react-hook-form";
import MuiTextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import ImagePicker from "./ImagePicker";
import RichTextEditor from "./RichTextEditor";

/**
 * Reusable form field primitives, all bound to the nearest
 * react-hook-form <FormProvider> via useFormContext(). Every admin
 * resource form should compose these instead of writing bespoke
 * label/error/helper-text wiring per page.
 */

function getError(errors, name) {
  return name.split(".").reduce((acc, key) => acc?.[key], errors);
}

export function TextField({ name, label, required, multiline, rows, maxLength, ...props }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = getError(errors, name);

  return (
    <MuiTextField
      {...register(name)}
      label={label}
      required={required}
      multiline={multiline}
      rows={rows}
      fullWidth
      size="small"
      error={!!error}
      helperText={error?.message ?? " "}
      slotProps={{ htmlInput: { maxLength } }}
      {...props}
    />
  );
}

export function SelectField({ name, label, options, required, ...props }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = getError(errors, name);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth size="small" required={required} error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Select label={label} {...field} {...props}>
            {options.map((opt) => (
              <MenuItem key={String(opt.value)} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{error?.message ?? " "}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

export function SwitchField({ name, label }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
          label={label}
        />
      )}
    />
  );
}

export function CheckboxField({ name, label }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
          label={label}
        />
      )}
    />
  );
}

export function ImageField({ name, label, required, hint, shape, aspectRatio }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = getError(errors, name);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <ImagePicker
          label={label}
          required={required}
          hint={hint}
          shape={shape}
          aspectRatio={aspectRatio}
          value={field.value}
          onChange={field.onChange}
          onRemove={() => field.onChange(null)}
          error={error?.message}
        />
      )}
    />
  );
}

export function RichTextField({ name, label, maxLength }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <RichTextEditor label={label} value={field.value ?? ""} onChange={field.onChange} maxLength={maxLength} />
      )}
    />
  );
}
