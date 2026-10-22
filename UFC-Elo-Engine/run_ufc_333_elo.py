import csv
import json
import math

# Load Elo dataset
elo_dict = {}
with open("elo_rankings/k_factor_adjust_current.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        if len(row) >= 2:
            try:
                elo_dict[row[0].strip()] = float(row[1])
            except ValueError:
                pass

# Load Peak Elo dataset
peak_dict = {}
with open("elo_rankings/k_adjust_fighter_peak_elo.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        if len(row) >= 2:
            try:
                peak_dict[row[0].strip()] = float(row[1])
            except ValueError:
                pass

# UFC 333 Bouts
bouts = [
    {"fight": "Featherweight Championship", "f1": "Alexander Volkanovski", "f2": "Movsar Evloev", "bout_id": "bout-1"},
    {"fight": "Bantamweight Championship", "f1": "Petr Yan", "f2": "Merab Dvalishvili", "bout_id": "bout-2"},
    {"fight": "Flyweight", "f1": "Lone'er Kavanagh", "f2": "Ramazan Temirov", "bout_id": "bout-3"},
    {"fight": "Heavyweight", "f1": "Alexander Volkov", "f2": "Rizvan Kuniev", "bout_id": "bout-4"},
    {"fight": "Featherweight", "f1": "Aaron Pico", "f2": "Losene Keita", "bout_id": "bout-5"},
    {"fight": "Light Heavyweight", "f1": "Azamat Murzakanov", "f2": "Dominick Reyes", "bout_id": "bout-6"},
    {"fight": "Light Heavyweight", "f1": "Abdul-Rakhman Yakhyaev", "f2": "Nikita Krylov", "bout_id": "bout-7"},
    {"fight": "Middleweight", "f1": "Abus Magomedov", "f2": "Cam Rowston", "bout_id": "bout-8"},
    {"fight": "Lightweight", "f1": "Grant Dawson", "f2": "Nurullo Aliev", "bout_id": "bout-9"},
    {"fight": "Bantamweight", "f1": "Asaf Chopurov", "f2": "Colby Thicknesse", "bout_id": "bout-10"},
    {"fight": "Middleweight", "f1": "Abubakar Vagaev", "f2": "Jacob Malkoun", "bout_id": "bout-11"},
    {"fight": "Lightweight", "f1": "Daniel Santos", "f2": "Bolaji Oki", "bout_id": "bout-12"},
    {"fight": "Lightweight", "f1": "Kody Steele", "f2": "Noah Gugnon", "bout_id": "bout-13"},
    {"fight": "Women's Strawweight", "f1": "Iasmin Lucindo", "f2": "Nicolle Caliari", "bout_id": "bout-14"}
]

name_aliases = {
    "Abus Magomedov": "Abusupiyan Magomedov",
    "Cam Rowston": "Cameron Rowston",
    "Daniel Santos": "Daniel Gustavo Santos"
}

def expected_score(elo_a, elo_b):
    return 1 / (1 + math.pow(10, (elo_b - elo_a) / 400.0))

def dec_to_american(prob):
    if prob >= 0.5:
        return f"-{int(round((prob / (1 - prob)) * 100))}"
    else:
        return f"+{int(round(((1 - prob) / prob) * 100))}"

default_elo = 1000.0  # Base debut Elo rating in this engine

results = []

print(f"{'BOUT':<28} | {'FIGHTER 1 (ELO)':<30} | {'FIGHTER 2 (ELO)':<30} | {'ELO FAVORITE':<22} | {'WIN PROB'}")
print("-" * 125)

for b in bouts:
    f1 = b["f1"]
    f2 = b["f2"]
    
    f1_s = name_aliases.get(f1, f1)
    f2_s = name_aliases.get(f2, f2)
    
    elo1 = elo_dict.get(f1_s, elo_dict.get(f1, default_elo))
    elo2 = elo_dict.get(f2_s, elo_dict.get(f2, default_elo))
    
    peak1 = peak_dict.get(f1_s, peak_dict.get(f1, elo1))
    peak2 = peak_dict.get(f2_s, peak_dict.get(f2, elo2))
    
    prob1 = expected_score(elo1, elo2)
    prob2 = 1.0 - prob1
    
    diff = elo1 - elo2
    fav = f1 if prob1 >= 0.5 else f2
    fav_prob = max(prob1, prob2)
    
    row = {
        "bout_id": b["bout_id"],
        "bout": b["fight"],
        "fighter_1": f1,
        "elo_1": round(elo1, 1),
        "peak_1": round(peak1, 1),
        "prob_1": round(prob1 * 100, 1),
        "odds_1": dec_to_american(prob1),
        "fighter_2": f2,
        "elo_2": round(elo2, 1),
        "peak_2": round(peak2, 1),
        "prob_2": round(prob2 * 100, 1),
        "odds_2": dec_to_american(prob2),
        "elo_diff": round(diff, 1),
        "elo_favorite": fav,
        "elo_fav_prob": round(fav_prob * 100, 1),
        "elo_fav_odds": dec_to_american(fav_prob)
    }
    results.append(row)
    
    f1_disp = f"{f1} ({elo1:.1f})"
    f2_disp = f"{f2} ({elo2:.1f})"
    print(f"{b['fight']:<28} | {f1_disp:<30} | {f2_disp:<30} | {fav:<22} | {fav_prob*100:.1f}% ({dec_to_american(fav_prob)})")

with open("ufc_333_elo_predictions.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

with open("ufc_333_elo_predictions.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=list(results[0].keys()))
    writer.writeheader()
    writer.writerows(results)

print("\nSuccessfully exported UFC 333 Elo Predictions to JSON & CSV!")
