export interface OnSubmit {
    finished: boolean,
    dataAfterSubmit?: any,
    hasError?: boolean,
    message?: string,
    backSync?: boolean
}