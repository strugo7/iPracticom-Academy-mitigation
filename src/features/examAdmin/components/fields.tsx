/**
 * פרימיטיבי-השדה של ה-feature הועלו ל-`components/ui/form` כשנדרשו גם ל-feature
 * המונחים (שלב 6.8) — פרימיטיב-פער משותף יושב ב-DS, לא משוכפל (CLAUDE.md §4).
 * הקובץ נשאר כ-re-export כדי לא לגעת ב-5 הצרכנים הקיימים בשלב 6.6.
 */
export {
  FieldLabel,
  FilterSelect,
  NumberStepper,
  SelectField,
  TagEditor,
  Textarea,
} from '@/components/ui'
