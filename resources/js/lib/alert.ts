import toastr from 'toastr';

const defaultOptions = {
    closeButton: true,
    newestOnTop: true,
    progressBar: true,
    preventDuplicates: true,
    positionClass: 'toast-top-right',
    timeOut: 4000,
    extendedTimeOut: 1000,
};

toastr.options = defaultOptions;

export function alertSuccess(message: string): JQuery {
    return toastr.success(message);
}

export function alertError(error: unknown): JQuery {
    return toastr.error(getErrorMessage(error));
}

export function alertLoading(message: string): JQuery {
    return toastr.info(message, 'Memproses...', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: false,
        progressBar: true,
    });
}

export function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
        const response = (error as { response?: { data?: { message?: unknown } } }).response;
        const responseMessage = response?.data?.message;

        if (typeof responseMessage === 'string' && responseMessage.trim()) {
            return responseMessage;
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    if (typeof error === 'string' && error.trim()) {
        return error;
    }

    return 'Terjadi kesalahan';
}
