export type ImportItem<T> = {
  line: string;
  index: number;
} & (
  | {
      valid: true;
      data: T;
    }
  | {
      valid: false;
      error: {
        message: string;
      };
    }
);
