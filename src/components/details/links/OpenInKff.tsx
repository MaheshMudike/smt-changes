import * as React from 'react';

import { SvgIcon } from '../../../constants/SvgIcon';
import { openObjectAsKffAudit } from '../../../services/externalApps';
import translate from '../../../utils/translate';
import IconButton from '../../layout/IconButton';

export function OpenInKff(props: { id: string }) {
    return (
        <IconButton
            label={translate('generic.button.kff.audit')}
            icon={SvgIcon.ButtonArrow}
            onClick={() => openObjectAsKffAudit(props.id)}
        />
    );
}
