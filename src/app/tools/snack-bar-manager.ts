import * as Snackbar from 'node-snackbar';

export class SnackBarManager {
    public static BOTTOM_CENTER = 'bottom-center';

    public static INFO_COLOR = '#5bc0de';
    public static SUCCESS_COLOR = '#5cb85c';
    public static WARNING_COLOR = '#f0ad4e';
    public static DANGER_COLOR = '#d9534f';

    public static DEFAULT_CLASS = 'p-snackbar-layout';

    constructor() { }

    public static showSnackMessage(message: string, actionText: string, position?: any, color?: string, customClass?: string) {
        Snackbar.show({
            text: message,
            pos: position ? position : this.BOTTOM_CENTER,
            actionText: actionText,
            actionTextColor: color ? color : this.INFO_COLOR,
            customClass: customClass ? customClass : this.DEFAULT_CLASS
        });
    }
}