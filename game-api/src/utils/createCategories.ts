import { CategoriesData, Category } from "../types/types";

const incompatiblePairs = [
    ["Jogo da Nintendo", "Jogo da From Software"],
    ["Lançado depois de 1999", "Lançado antes de 1999"],
    ["Lançado em 2020 ou depois", "Lançado antes de 1999"]
];

export const createCategories = (categoriesData: CategoriesData) => {
    const selectedCategories: Category[] = [];
    const selectedNames: Set<string> = new Set();
    let i = 0;

    const areCategoriesIncompatible = (category1: string, category2: string) => {
        return incompatiblePairs.some(
            (pair) => (pair.includes(category1) && pair.includes(category2))
        );
    };

    while (selectedCategories.length != 6) {
        const randomIndex = Math.floor(Math.random() * categoriesData.categories.length);
        const category = categoriesData.categories[randomIndex];

        const isIncompatible = selectedCategories.some((selectedCategory) =>
            areCategoriesIncompatible(selectedCategory.name, category.name)
        );

        if (!isIncompatible && !selectedNames.has(category.name)) {
            selectedCategories.push(category);
            selectedNames.add(category.name);
        }
    }

    return selectedCategories;
};
