export interface ISimpleToast {
    message: string;
    requiresManualHiding?: boolean;
}

export interface ILinkToast extends ISimpleToast {
    linkUrl: string;
    linkTitle: string;
}

export interface IActionToast extends ISimpleToast {
    action: () => void;
    actionTitle: string;
}

export type Toast = ISimpleToast | ILinkToast | IActionToast;

export function isLinkToast(t: Toast): t is ILinkToast {
    return 'linkUrl' in t;
}

export function isActionToast(t: Toast): t is IActionToast {
    return 'action' in t;
}
