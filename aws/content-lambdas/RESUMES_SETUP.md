# Resume Management Setup

These lambdas implement bilingual resume storage in AWS with:

- S3 for the PDF files
- DynamoDB for metadata and active-version state
- a capped history per language

## Expected routes

- `GET /resumes` -> list manifest and history
- `POST /resumes` -> upload a new PDF version
- `POST /resumes/{id}/activate` -> make one version active for its language
- `DELETE /resumes/{id}` -> delete an inactive version
- `GET /resumes/download?lang=en|es` -> download the active PDF for that language

## Required environment variables

- `AWS_REGION`
- `RESUMES_BUCKET`
- `RESUMES_TABLE`
- `RESUMES_BY_LANGUAGE_INDEX`
  Recommended value: `LanguageUploadedAtIndex`

## Optional environment variables

- `RESUME_HISTORY_LIMIT`
  Default: `5`
- `RESUME_MAX_FILE_BYTES`
  Default: `5242880`

## DynamoDB item shape

The metadata table is expected to store items like:

```json
{
  "id": "uuid",
  "language": "en",
  "file_name": "Juan_Sanchez_CV_EN.pdf",
  "storage_key": "resumes/en/2026-04-17T10-00-00-000Z-uuid-file.pdf",
  "content_type": "application/pdf",
  "size_bytes": 153422,
  "uploaded_at": "2026-04-17T10:00:00.000Z",
  "is_active": true
}
```

## Recommended DynamoDB schema

- Table primary key: `id` (String)
- Global secondary index: `LanguageUploadedAtIndex`
  - partition key: `language` (String)
  - sort key: `uploaded_at` (String)
  - projection: `ALL`

## Notes

- The history cap is enforced per language.
- Active resumes are protected from deletion.
- When the history limit is exceeded, the oldest inactive versions are pruned automatically.
- The lambdas query by language through the GSI instead of scanning the whole table.
