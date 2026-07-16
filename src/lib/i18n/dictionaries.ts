import type { Locale } from '@/types/progress';

export interface Dictionary {
  nav: {
    home: string;
    sections: string;
    lessons: string;
    comparisons: string;
    appendices: string;
    progress: string;
    search: string;
    favorites: string;
  };
  buttons: {
    start: string;
    continue: string;
    complete: string;
    next: string;
    previous: string;
    check: string;
    tryAgain: string;
    showAnswer: string;
    reset: string;
    save: string;
    cancel: string;
    back: string;
    favorite: string;
    unfavorite: string;
  };
  empty: {
    noResults: string;
    noFavorites: string;
    noNotes: string;
    noProgress: string;
    noLessons: string;
  };
  lesson: {
    examples: string;
    mistakes: string;
    exercises: string;
    formula: string;
    uses: string;
    memoryTip: string;
    related: string;
    minutes: string;
    level: string;
  };
  exercise: {
    correct: string;
    incorrect: string;
    hint: string;
    explanation: string;
    score: string;
    passed: string;
    failed: string;
    attempt: string;
  };
  progress: {
    completed: string;
    started: string;
    studyDays: string;
    weakLessons: string;
    studyMinutes: string;
    lastLesson: string;
  };
  search: {
    placeholder: string;
    lessons: string;
    examples: string;
    mistakes: string;
    comparisons: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  common: {
    loading: string;
    error: string;
    language: string;
  };
}

const ar: Dictionary = {
  nav: {
    home: 'الرئيسية',
    sections: 'الأقسام',
    lessons: 'الدروس',
    comparisons: 'المقارنات',
    appendices: 'الملاحق',
    progress: 'تقدمي',
    search: 'بحث',
    favorites: 'المفضلة',
  },
  buttons: {
    start: 'ابدأ',
    continue: 'متابعة',
    complete: 'إكمال',
    next: 'التالي',
    previous: 'السابق',
    check: 'تحقق',
    tryAgain: 'حاول مرة أخرى',
    showAnswer: 'أظهر الإجابة',
    reset: 'إعادة تعيين',
    save: 'حفظ',
    cancel: 'إلغاء',
    back: 'رجوع',
    favorite: 'أضف للمفضلة',
    unfavorite: 'إزالة من المفضلة',
  },
  empty: {
    noResults: 'لا توجد نتائج.',
    noFavorites: 'لا توجد دروس في المفضلة بعد.',
    noNotes: 'لا توجد ملاحظات بعد.',
    noProgress: 'لم تبدأ أي درس بعد.',
    noLessons: 'لا توجد دروس في هذا القسم.',
  },
  lesson: {
    examples: 'أمثلة',
    mistakes: 'أخطاء شائعة',
    exercises: 'تمارين',
    formula: 'الصيغة',
    uses: 'الاستخدامات',
    memoryTip: 'نصيحة للحفظ',
    related: 'دروس ذات صلة',
    minutes: 'دقيقة',
    level: 'المستوى',
  },
  exercise: {
    correct: 'إجابة صحيحة',
    incorrect: 'إجابة غير صحيحة',
    hint: 'تلميح',
    explanation: 'الشرح',
    score: 'النتيجة',
    passed: 'ناجح',
    failed: 'حاول مرة أخرى',
    attempt: 'المحاولة',
  },
  progress: {
    completed: 'دروس مكتملة',
    started: 'دروس بدأت',
    studyDays: 'أيام الدراسة',
    weakLessons: 'نقاط الضعف',
    studyMinutes: 'دقائق الدراسة تقريباً',
    lastLesson: 'آخر درس',
  },
  search: {
    placeholder: 'ابحث في القواعد والأمثلة والأخطاء...',
    lessons: 'الدروس',
    examples: 'الأمثلة',
    mistakes: 'الأخطاء',
    comparisons: 'المقارنات',
  },
  theme: {
    light: 'فاتح',
    dark: 'داكن',
    system: 'حسب النظام',
  },
  common: {
    loading: 'جاري التحميل...',
    error: 'حدث خطأ.',
    language: 'اللغة',
  },
};

const en: Dictionary = {
  nav: {
    home: 'Home',
    sections: 'Sections',
    lessons: 'Lessons',
    comparisons: 'Comparisons',
    appendices: 'Appendices',
    progress: 'Progress',
    search: 'Search',
    favorites: 'Favorites',
  },
  buttons: {
    start: 'Start',
    continue: 'Continue',
    complete: 'Complete',
    next: 'Next',
    previous: 'Previous',
    check: 'Check',
    tryAgain: 'Try again',
    showAnswer: 'Show answer',
    reset: 'Reset',
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    favorite: 'Add to favorites',
    unfavorite: 'Remove from favorites',
  },
  empty: {
    noResults: 'No results found.',
    noFavorites: 'No favorite lessons yet.',
    noNotes: 'No notes yet.',
    noProgress: 'You have not started any lesson yet.',
    noLessons: 'No lessons in this section.',
  },
  lesson: {
    examples: 'Examples',
    mistakes: 'Common mistakes',
    exercises: 'Exercises',
    formula: 'Formula',
    uses: 'Uses',
    memoryTip: 'Memory tip',
    related: 'Related lessons',
    minutes: 'min',
    level: 'Level',
  },
  exercise: {
    correct: 'Correct',
    incorrect: 'Incorrect',
    hint: 'Hint',
    explanation: 'Explanation',
    score: 'Score',
    passed: 'Passed',
    failed: 'Try again',
    attempt: 'Attempt',
  },
  progress: {
    completed: 'Completed lessons',
    started: 'Started lessons',
    studyDays: 'Study days',
    weakLessons: 'Weak lessons',
    studyMinutes: 'Approx. study minutes',
    lastLesson: 'Last lesson',
  },
  search: {
    placeholder: 'Search rules, examples, and mistakes...',
    lessons: 'Lessons',
    examples: 'Examples',
    mistakes: 'Mistakes',
    comparisons: 'Comparisons',
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  common: {
    loading: 'Loading...',
    error: 'Something went wrong.',
    language: 'Language',
  },
};

export const dictionaries = {
  ar,
  en,
} as const satisfies Record<Locale, Dictionary>;
