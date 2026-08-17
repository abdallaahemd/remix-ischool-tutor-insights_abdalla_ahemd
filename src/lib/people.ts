/**
 * Central directory of Mentors and Team Leaders.
 * Add future names here — both dropdowns read from these lists,
 * de-duplicate automatically and sort alphabetically by first name.
 */

const RAW_MENTORS = [
  "Abdelrahman Mohamed",
  "Abdalla Ahmed Konsowa",
  "Ahmed Essam",
  "Ahmed M. Farid",
  "Ahmed Mohamed",
  "Ahmed Mohamed",
  "Ahmed Samir Elzoghby",
  "Ahmed Samir",
  "Amal Yasser",
  "Amany Abd El Hamid",
  "Amira Badawy",
  "Amira Eslam",
  "Amira Fayez",
  "Amira Magdy",
  "Amr Khaled",
  "Andrew Zaky",
  "Aya El-Zoghby",
  "Doaa Ahmed Morsy",
  "Estabrq Bela",
  "Fatma Alzahraa",
  "Fatma Mahmoud",
  "Hadeel Yasser",
  "Hager Hany",
  "Hager Yasser",
  "Kirollos Aziz",
  "Mariam Emad",
  "Mariam Hussien",
  "Mariam",
  "Mohamed Reda",
  "Mennatallah Ashraf",
  "Nada Essam",
  "Nariman Mounir",
  "Nesma Farid",
  "Noha Abdelrheem",
  "Nourhan Elsayed",
  "Pancee Muhammad",
  "Radwa Ashraf",
  "Rehab Muhamed",
  "Rewan Ramadan",
  "Sayed Mamdouh",
  "Seif Taalab",
  "Shams Gamal",
  "Shrouk Ghania",
  "Sosanna Emad",
  "Toqa Desawe",
  "Yasser Mohamed",
  "Yomna Tarek",
];

const RAW_TEAM_LEADERS = [
  "Ahmed Hesham",
  "Anan Mohamed",
  "Ghada Mohamed",
  "Kareem Abdelwahab",
  "Nermeen Alhububati",
];

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

export function normalizeNames(names: string[]) {
  const unique = new Map<string, string>();
  for (const raw of names) {
    const name = raw.trim().replace(/\s+/g, " ");
    if (!name) continue;
    const key = name.toLowerCase();
    if (!unique.has(key)) unique.set(key, name);
  }
  return Array.from(unique.values()).sort(
    (a, b) =>
      firstName(a).localeCompare(firstName(b), undefined, { sensitivity: "base" }) ||
      a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

export const MENTORS = normalizeNames(RAW_MENTORS);
export const TEAM_LEADERS = normalizeNames(RAW_TEAM_LEADERS);
