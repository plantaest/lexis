import * as v from 'valibot';

export const referenceFormSchema = v.object({
  id: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Không để trống'),
    v.regex(/^[A-Za-z0-9-]{1,5}$/, 'ID chỉ được chứa 0-9, A-Z, a-z, "-" và tối đa 5 ký tự'),
  ),
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
});
