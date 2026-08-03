import type { FC } from 'react';
import { useSelector } from 'react-redux';
import { SGroupDataRender } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectShowPreview, selectEditor } from 'state/common';
import { PreviewType } from 'state/types';

const DataSGroupPreview: FC = () => {
  const preview = useAppSelector(selectShowPreview);
  const editor = useSelector(selectEditor);

  if (!preview || preview.type !== PreviewType.DataSGroup) {
    return null;
  }

  const target = preview.target;
  const hoverRect = target?.getBoundingClientRect() ?? new DOMRect();
  const ketcherRootElement = editor?.ketcherRootElement;
  const canvasRect =
    ketcherRootElement?.getBoundingClientRect() ?? new DOMRect();

  const sGroupData = `${preview.fieldName}=${preview.fieldValue}`;

  return (
    <SGroupDataRender
      hoverRect={hoverRect}
      canvasRect={canvasRect}
      sGroupData={sGroupData}
      data-testid="data-sgroup-preview"
    />
  );
};

export default DataSGroupPreview;
