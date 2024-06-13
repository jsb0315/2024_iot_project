import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";

const CustomChip = styled(Chip)(({ theme, isactive }) => ({
  backgroundColor: isactive
    ? theme.palette.info.main
    : theme.palette.common.white,
  color: isactive ? theme.palette.common.white : theme.palette.text.primary,
  "&:hover": {
    backgroundColor: isactive
      ? theme.palette.info.dark
      : theme.palette.grey[200],
  },
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  marginTop: "15px !important",
  marginRight: "15px !important",
  marginLeft: "15px !important",
}));

export default function CheckboxItems({ items, checkedItems, handleChip }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      justifyContent="start"
      alignItems="center"
      sx={{ flexWrap: "wrap", width: "90%", marginTop: "3%",marginBottom: "5%",marginLeft: "5%", marginRight: "5%", overflowY: "auto"}}
    >
      {items.map(item => (
        <CustomChip
          key={item}
          label={item}
          onClick={() => handleChip(item)}
          isactive={checkedItems.includes(item) ? 1 : 0}
        />
      ))}
    </Stack>
  );
}
