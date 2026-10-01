// Freely licensed dish photos from Wikimedia Commons, picked by hand and checked.
// These show the *dish*, not a specific stall, so the UI always labels them "Representative photo".

export type DishPhoto = { url: string; page: string; author: string; license: string };

export const DISH_PHOTOS = {
  "masala-dosa": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Masala_dosa_01.jpg/960px-Masala_dosa_01.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Masala_dosa_01.jpg",
    author: "Marajozkee",
    license: "CC BY-SA 4.0",
  },
  "thatte-idli": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Thatte_Idli.jpg/960px-Thatte_Idli.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Thatte_Idli.jpg",
    author: "Abhishek Rao",
    license: "CC BY-SA 4.0",
  },
  "masala-puri": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Masala_Puri%2C_karnataka_street_food.jpg/960px-Masala_Puri%2C_karnataka_street_food.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Masala_Puri,_karnataka_street_food.jpg",
    author: "Mallikarjunasj",
    license: "CC BY-SA 4.0",
  },
  "pani-puri": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Crispy_Pani_Puri.jpg/960px-Crispy_Pani_Puri.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Crispy_Pani_Puri.jpg",
    author: "Teena Sometimes",
    license: "CC BY-SA 4.0",
  },
  "seekh-kebab": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Indian_Chicken_Seekh_Kebab.jpg/960px-Indian_Chicken_Seekh_Kebab.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Indian_Chicken_Seekh_Kebab.jpg",
    author: "Ishitadsa",
    license: "CC BY-SA 4.0",
  },
  "filter-coffee": {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/84/Indian_filter_coffee_in_Dabarah.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Indian_filter_coffee_in_Dabarah.jpg",
    author: "Unknown",
    license: "CC BY-SA 3.0",
  },
  "momos": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Steamed_Momos_-_KOLKATA.jpg/960px-Steamed_Momos_-_KOLKATA.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Steamed_Momos_-_KOLKATA.jpg",
    author: "TAPAS KUMAR HALDER",
    license: "CC BY-SA 4.0",
  },
  "ragi-mudde": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Ragi_Mudde_-_Bassaru.jpg/960px-Ragi_Mudde_-_Bassaru.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Ragi_Mudde_-_Bassaru.jpg",
    author: "Akshhara",
    license: "CC BY-SA 3.0",
  },
  "holige": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Obbattu.jpg/960px-Obbattu.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Obbattu.jpg",
    author: "GaneshDatta (talk) (Uploads)",
    license: "CC BY 3.0",
  },
  "biryani": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Biryani_Home.jpg/960px-Biryani_Home.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Biryani_Home.jpg",
    author: "Shyamveer.singh1982",
    license: "CC BY-SA 4.0",
  },
  "juice": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Sugarcane_juice_Flavours.jpg/960px-Sugarcane_juice_Flavours.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Sugarcane_juice_Flavours.jpg",
    author: "Sayhi2kojo",
    license: "CC BY-SA 4.0",
  },
  "falooda": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Falooda_icecream.jpg/960px-Falooda_icecream.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Falooda_icecream.jpg",
    author: "Wind Hashira",
    license: "CC BY-SA 4.0",
  },
  "sweets": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg/960px-A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg",
    page: "https://commons.wikimedia.org/wiki/File:A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg",
    author: "DDohler",
    license: "CC BY 2.0",
  },
  "roll": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Chicken_Kathi_Roll_%285646735923%29.jpg/960px-Chicken_Kathi_Roll_%285646735923%29.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Chicken_Kathi_Roll_(5646735923).jpg",
    author: "Andy Mitchell from Glasgow, UK",
    license: "CC BY-SA 2.0",
  },
  "burger": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Veg_Bean_Burger_with_Fries.jpg/960px-Veg_Bean_Burger_with_Fries.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Veg_Bean_Burger_with_Fries.jpg",
    author: "Kabirsabri",
    license: "CC BY-SA 4.0",
  },
  "pizza": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/Two_pizza_slices.jpg/960px-Two_pizza_slices.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Two_pizza_slices.jpg",
    author: "Douglas Perkins",
    license: "CC0",
  },
  "chicken": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Chicken_65_%28Dish%29.jpg/960px-Chicken_65_%28Dish%29.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Chicken_65_(Dish).jpg",
    author: "Amiyashrivastava",
    license: "CC BY-SA 3.0",
  },
  "sandwich": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Bombay_Sandwich.jpg/960px-Bombay_Sandwich.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Bombay_Sandwich.jpg",
    author: "Princejain17",
    license: "CC BY-SA 4.0",
  },
  "noodles": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Tasty_hakka_noodles_image.jpg/960px-Tasty_hakka_noodles_image.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Tasty_hakka_noodles_image.jpg",
    author: "SGUae",
    license: "CC BY 4.0",
  },
  "meals": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/A_Thali%2C_famous_South_Indian_meal_served_on_a_banana_leaf.jpg/960px-A_Thali%2C_famous_South_Indian_meal_served_on_a_banana_leaf.jpg",
    page: "https://commons.wikimedia.org/wiki/File:A_Thali,_famous_South_Indian_meal_served_on_a_banana_leaf.jpg",
    author: "Melanie M",
    license: "CC BY 2.0",
  },
} satisfies Record<string, DishPhoto>;

export type DishKey = keyof typeof DISH_PHOTOS;
