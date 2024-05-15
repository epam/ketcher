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
  width: 'calc(50% - 6px)',
  height: '28px',

  '& .MuiOutlinedInput-root:hover': {
    border: `1px solid ${theme.ketcher.color.input.border.hover}`,
  },

  '& .MuiOutlinedInput-root': {
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
}));
