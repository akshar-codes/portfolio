import { FormProvider } from "react-hook-form";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

/**
 * Consistent form page/section chrome: title, description, RHF-bound
 * content, sticky action footer. `form` is a react-hook-form
 * `useForm()` return value — this component owns the FormProvider and
 * the submit handler wiring, so field components (see ./fields) never
 * need props drilled in.
 *
 * Meant for real multi-field resource forms (Profile, Resume, Project
 * edit). A single-field inline form (like the Categories "add" row)
 * doesn't need this chrome — use FormProvider directly there instead.
 */
export default function FormLayout({
  form,
  onSubmit,
  title,
  description,
  children,
  error,
  saving = false,
  submitLabel = "Save changes",
  cancelLabel = "Cancel",
  onCancel,
  submitDisabled = false,
  variant = "page", // 'page' | 'dialog'
}) {
  const Wrapper = variant === "page" ? Paper : Box;
  const wrapperProps = variant === "page" ? { variant: "outlined", sx: { borderRadius: 3, p: { xs: 2.5, sm: 4 } } } : {};

  return (
    <FormProvider {...form}>
      <Wrapper component="form" onSubmit={form.handleSubmit(onSubmit)} noValidate {...wrapperProps}>
        {(title || description) && (
          <Box className="mb-5">
            {title && (
              <Typography variant="h6" fontWeight={700}>
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="body2" color="text.secondary" className="mt-1">
                {description}
              </Typography>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" className="mb-4" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>{children}</Stack>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end" className="mt-6 pt-4" sx={{ borderTop: "1px solid", borderColor: "divider" }}>
          {onCancel && (
            <Button type="button" variant="text" color="inherit" onClick={onCancel} disabled={saving}>
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={saving || submitDisabled}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? "Saving…" : submitLabel}
          </Button>
        </Stack>
      </Wrapper>
    </FormProvider>
  );
}
