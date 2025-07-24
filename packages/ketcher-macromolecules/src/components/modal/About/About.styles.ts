import styled from '@emotion/styled';

export const About = styled('div')(({ theme }) => ({
  width: '430px',
  minHeight: '260px',
  padding: '0 18px',
  borderRadius: '6px',
  fontSize: '12px',
  color: theme.ketcher.color.text.primary,
  fontWeight: theme.ketcher?.font?.weight?.regular,

  a: {
    color: '#167782',
  },

  '.body': {
    borderRadius: '6px',
    padding: '5px 65px',
    overflowY: 'auto',
    overflowX: 'hidden',

    '.versionName': {
      fontWeight: 400,
      marginBottom: '2px',
    },

    '.firstline': {
      display: 'inline-block',
    },

    '.links': {
      textAlign: 'right',
    },

    '.indigoVersion': {
      marginTop: '20px',
      display: 'flex',
      gap: '2px',
    },
  },

  '.headerContent': {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 30px',

    a: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
      color: theme.ketcher?.color?.text?.primary,
    },

    '.title': {
      fontSize: '20px',
      lineHeight: '22px',
    },
  },

  '.indigoFirstLine': {
    display: 'inline-block',
  },

  dd: {
    margin: 0,
    marginBottom: '0.2em',
  },

  dt: {
    marginTop: '3px',
  },

  '.okButton': {
    border: '1px solid #333333',
    backgroundColor: '#FFFFFF',
    color: '#333333',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    outline: 'none',
    minWidth: '70px',
    lineHeight: '14px',
    height: '24px',
    borderRadius: '4px',
    fontSize: '10px',
    '&:hover': {
      color: '#333333',
      border: '1px solid  #333333',
    },
    '&:active': {
      color: '#333333',
      border: '1px solid #333333',
    },
    '&:disabled': {
      color: 'rgba(51, 51, 51, 0.7)',
      border: '1px solid rgba(51, 51, 51, 0.7)',
    },
  },

  '.aboutFooter': {
    borderTop: '1px solid #e1e5ea',
    margin: 0,
    padding: '15px 0',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}));
