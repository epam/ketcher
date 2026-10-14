import { useTranslation } from 'react-i18next';
import classes from './StructEditor.module.less';

const ImageDropOverlay = () => {
  const { t } = useTranslation('components');

  return (
    <div className={classes.imageDropOverlay} data-testid="image-drop-overlay">
      <span className={classes.imageDropLabel}>
        {t('structEditor.dropImageHere')}
      </span>
    </div>
  );
};

export default ImageDropOverlay;
