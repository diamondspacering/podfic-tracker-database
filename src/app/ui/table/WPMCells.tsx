import { getLengthValue } from '@/app/lib/lengthHelpers';
import { PodficStatus } from '@/app/types';

export const WPMCell = (props) => {
  let value = null;
  if (!!props.row.getValue('wordcount') && !!props.row.getValue('length')) {
    value = Math.round(
      parseInt(props.row.getValue('wordcount')) /
        (props.row.getValue('plain_length')
          ? getLengthValue(props.row.getValue('plain_length')) / 60
          : getLengthValue(props.row.getValue('length')) / 60)
    );
  }
  return <span>{value}</span>;
};

export const RawWPMCell = (props) => {
  let value = null;
  if (
    !!props.row.getValue('wordcount') &&
    !!props.row.getValue('raw_length') &&
    !(props.row.getValue('status') === PodficStatus.RECORDING)
  ) {
    value = Math.round(
      parseInt(props.row.getValue('wordcount')) /
        (getLengthValue(props.row.getValue('raw_length')) / 60)
    );
  }
  return <span>{value}</span>;
};
