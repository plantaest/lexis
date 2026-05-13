import * as v from 'valibot';

export const referenceSchema = v.variant('type', [
  v.object({
    type: v.literal('ref'),
    id: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty('Không để trống; và phải chọn từ danh sách'),
      v.regex(/^[A-Za-z0-9-]{1,5}$/, 'ID chỉ được chứa 0-9, A-Z, a-z, "-" và tối đa 5 ký tự'),
    ),
  }),
  v.object({
    type: v.literal('inline'),
    content: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty('Không để trống'),
      v.maxLength(200, 'Tối đa 200 ký tự'),
      v.check((value) => !value.includes('|'), 'Không được chứa ký tự "|"'),
    ),
    url: v.pipe(
      v.string(),
      v.trim(),
      v.check(
        (value) => !value || (/^https?:\/\//.test(value) && URL.canParse(value)),
        'URL hợp lệ và bắt đầu bằng http:// hoặc https://',
      ),
    ),
  }),
]);

export const translationSchema = v.object({
  target: v.pipe(v.string(), v.trim(), v.nonEmpty('Không để trống')),
  note: v.optional(v.pipe(v.string(), v.trim())),
  references: v.array(referenceSchema),
});

export const termFormSchema = v.object({
  term: v.pipe(v.string(), v.trim(), v.nonEmpty('Không để trống')),
  aliases: v.array(v.pipe(v.string(), v.trim())),
  translations: v.pipe(v.array(translationSchema), v.nonEmpty('Phải có ít nhất 1 bản dịch')),
});

export type TermFormValues = v.InferOutput<typeof termFormSchema>;
