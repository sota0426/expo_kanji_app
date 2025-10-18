import { ProcessedDataProps } from "@/app/busyu";
import { StyleSheet } from "react-native";

export type KanjiData = ProcessedDataProps['kanji'][number];


export const main_styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    radicalContainer: {
        backgroundColor: '#DBEAFE',
        borderRadius: 8,
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radicalText: {
        fontSize: 60,
        fontWeight: 'bold',
        color: '#1E40AF',
    },
    countText: {
        color: '#374151',
        fontSize: 16,
    },
});
