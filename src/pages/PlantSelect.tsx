import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
    StyleSheet,
    FlatList, // usado para renderizar listas na tela
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PlantProps } from '../libs/storage';

import { EnviromentButton } from '../components/EnviromentButton';
import { Header } from '../components/Header';
import { PlantCardPrimary } from '../components/PlanCardPrimary';
import { Load } from '../components/Load';

import api from '../services/api';
import colors from '../styles/colors';
import fonts from '../styles/fonts';

interface EnviromentProps {
    key: string;
    title: string;
};

export function PlantSelect() {
    const [enviroments, setEnviroments] = useState<EnviromentProps[]>();
    const [plants, setPlants] = useState<PlantProps[]>([]);
    const [filteredPlants, setFilteredPlants] = useState<PlantProps[]>([]);
    const [enviromentSelected, setEnviromentSelected] = useState('all');
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(true);

    const navigation = useNavigation();

    function handleEnviromentSelected(environment: string) {
        setEnviromentSelected(environment);

        if(environment == 'all') return setFilteredPlants(plants);

        const filtered = plants?.filter(plant => plant.environments.includes(environment));

        return setFilteredPlants(filtered);
    };

    async function fetchPlants() {
        const { data } = await api
            .get(`plants?_sort=name&_order=asc&_page=${page}&_limit=8`);

        if (!data) return setLoading(true);

        if (page > 1) {
            setPlants(oldValue => [...oldValue, ...data]);
            setFilteredPlants(oldValue => [...oldValue, ...data]);
        }
        else {
            setPlants(data);
            setFilteredPlants(data);
        }

        setLoading(false); // para animação de carregamento de página
        setLoadingMore(false); // para animação de rolagem
    };

    // quando chegar no final da rolagem chama mais dados pro usuário
    async function handleFetchMore(distance: number) {
        if(distance < 1) return;

        setLoadingMore(true);
        setPage(oldValue => oldValue + 1);
        fetchPlants();
    };

    function handlePlantSelect(plant: PlantProps) {
        // passar valores pra tela
        navigation.navigate('PlantSave', { plant });
    };

    useEffect(() => {
        async function fetchEnviroment(){
            const { data } = await api.get('plants_environments?_sort=title&_order=asc');

            setEnviroments([
                {
                    key: 'all',
                    title: 'Todos'
                },
                ...data
            ]);
        };

        fetchEnviroment();
    }, [])

    useEffect(() => {
        fetchPlants();
    }, [])



    if(loading) return <Load />

    return (
        // Scroll permite que telas menores visualizem as infos, rolando a view caso precise
        
            <View style={styles.container}>
                <View style={styles.header}>
                    <Header />
                    <Text style={styles.title}>
                        Em qual ambiente 
                    </Text>
                    <Text style={styles.subtitle}>
                        você quer colocar sua planta?
                    </Text>
                </View>
                
                <View>
                    <FlatList 
                        data={enviroments}
                        keyExtractor={(item) => String(item.key)}
                        renderItem={({ item }) => (
                            <EnviromentButton 
                                title={item.title} 
                                active={item.key === enviromentSelected} 
                                onPress={() => handleEnviromentSelected(item.key)}
                            />
                        )} 
                        horizontal
                        showsHorizontalScrollIndicator={ false } // esconde a sublinhado da lista, barra
                        contentContainerStyle={styles.enviromentList}
                    />
                </View>

                <View style={styles.plants}>
                    <FlatList 
                        data={filteredPlants}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item }) => (
                            <PlantCardPrimary 
                                data={item}
                                onPress={() => handlePlantSelect(item)}
                            />

                        )} 
                        numColumns={2}
                        showsVerticalScrollIndicator={ false } // esconde a sublinhado da lista, barra
                        // contentContainerStyle={styles.contentContainerStyle}
                        onEndReachedThreshold={0.1}
                        onEndReached={({distanceFromEnd}) => handleFetchMore(distanceFromEnd)}
                        ListFooterComponent={
                            loadingMore
                            ?
                                <ActivityIndicator color={colors.green} />
                            : 
                                <></>
                        }
                    />
                </View>
            </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    header: {
        padding: 30
    },
    title: {
        fontSize: 17,
        color: colors.heading,
        fontFamily: fonts.heading,
        lineHeight: 20,
        marginTop: 15
    },
    subtitle: {
        fontSize: 17,
        color: colors.heading,
        fontFamily: fonts.text,
        lineHeight: 20
    },
    enviromentList: {
        height: 40,
        justifyContent: 'center',
        paddingBottom: 5,
        marginLeft: 32,
        marginVertical: 32
    },
    plants: {
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: 'center'
    }
});