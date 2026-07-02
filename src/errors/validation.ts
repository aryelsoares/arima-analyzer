// Validation

export class ValidationError extends Error {
    title: string;
    isError: boolean;

    constructor(title: string, message: string, isError?: boolean) {
        super(message);
        this.name = "ValidationError";
        this.title = title;
        this.isError = isError || true;
    }
}