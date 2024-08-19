type Condition = {
    field: string;
    operator: string;
    value: string | number;
};

type Category = {
    name: string;
    type: string;
    condition: Condition;
};

type CategoriesData = {
    categories: Category[];
};

const incompatiblePairs = [
    ["Jogo da Nintendo", "Jogo da From Software"],
    ["Lançado depois de 1999", "Lançado antes de 1999"]
];

export const createCategories = (categoriesData: CategoriesData) => {
    const selectedCategories: Category[] = [];
    const selectedTypes: Set<string> = new Set();
    let i = 0;

    while (selectedCategories.length != 6) {
        const randomIndex = Math.floor(Math.random() * categoriesData.categories.length)
        const category = categoriesData.categories[randomIndex];

        if (!selectedTypes.has(category.type)) {
            selectedCategories.push(category);
            selectedTypes.add(category.type);
        }
    }
    return selectedCategories;
}