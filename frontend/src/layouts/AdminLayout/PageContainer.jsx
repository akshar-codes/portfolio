import Box from "@mui/material/Box";

export default function PageContainer({ children }) {
  return (
    <Box component="section" className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1400px] mx-auto">
      {children}
    </Box>
  );
}
