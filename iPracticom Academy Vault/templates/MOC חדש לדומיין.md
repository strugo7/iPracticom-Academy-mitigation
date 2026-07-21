---
domain: "<% tp.file.title %>"
type: moc
---

# MOC — <% tp.file.title %>

דף כניסה לכל התוכן בדומיין הזה. הטבלה למטה נבנית אוטומטית (Dataview) מכל note עם `domain` תואם — לא צריך לעדכן ידנית.

```dataview
TABLE type, vendor, status
FROM ""
WHERE domain = "<% tp.file.title %>"
SORT type ASC
```

## קישורים ידניים מהירים
-
