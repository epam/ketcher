import styled from '@emotion/styled';
import { DropDown } from 'components/shared/dropDown';

export const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  height: '300px',
});

export const Row = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '16px',
});

export const StyledDropdown = styled(DropDown)(({ theme }) => ({
  width: '230px',
  height: '28px',
  flexShrink: 0,

  '& .MuiOutlinedInput-root:hover:not(.Mui-disabled)': {
    border: `1px solid ${theme.ketcher.color.input.border.hover}`,
  },

  '& .MuiOutlinedInput-root': {
    height: '28px !important',
    border: `1px solid ${theme.ketcher.color.input.border.regular}`,
    backgroundColor: theme.ketcher.color.background.primary,
    color: theme.ketcher.color.text.primary,
    fontFamily: theme.ketcher.font.family.inter,
  },
}));

export const stylesForExpanded = {
  border: 'none',
};

export const Loader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
`;

export const SvgPreview = styled('div')(({ theme }) => ({
  height: '100%',
  position: 'relative',
  border: `1px solid ${theme.ketcher.color.input.border.regular}`,
  '& svg': {
    width: '100%',
    height: '100%',
    '& .drawn-structures': {
      '& .monomer': {
        lineHeight: 'initial !important',
      },
    },
  },
}));

export const PreviewContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  position: 'relative',

  '& button': {
    opacity: 0,
    position: 'absolute',
    right: '12px',
    top: '12px',
    borderRadius: '4px',
    padding: '2px',
    width: '28px',
    height: '28px',

    '&:not(:active)': {
      backgroundColor: theme.ketcher.color.background.primary,
      color: theme.ketcher.color.text.primary,
    },
  },

  '&:hover button': {
    opacity: 1,
  },

  '&:focus-within button': {
    opacity: 0,
  },

  '&:focus-within button:hover': {
    opacity: 1,
  },
}));
