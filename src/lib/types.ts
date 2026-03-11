export type Preferences = {
  interests: string[];
  time: string;
  budget: string;
  mode: string;
  transport: string;
  vibe: string[];
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  interests: string[];
  time: string;
  budget: string;
  mode: string;
  transport: string[];
  vibe: string[];
  locationSuggestion: string | undefined;
  checklist: string[] | undefined;
  tags: string[] | undefined;
};

export type JournalEntry = {
  id: string;
  questId: string;
  title: string;
  completedAt: string;
  note: string | undefined;
  imageUrl: string | undefined;
  locationText: string | undefined;
  companions: string | undefined;
  tags: string[] | undefined;
};
