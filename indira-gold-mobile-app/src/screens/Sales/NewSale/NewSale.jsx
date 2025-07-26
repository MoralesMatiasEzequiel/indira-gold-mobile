import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    FlatList, 
    Switch,
    Pressable, 
    StyleSheet, 
    Platform,
    Keyboard, 
    TouchableWithoutFeedback 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../../../redux/productActions';
import { getClients, getClientById } from '../../../redux/clientActions';


const NewSale = () => {

    const Wrapper = Platform.OS === 'web' ? View : TouchableWithoutFeedback;

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getProducts());
        dispatch(getClients());
    }, [dispatch]);

    const products = useSelector(state => state.products.products) ?? [];
    const clients = useSelector(state => state.clients.clients);
    const clientById = useSelector(state => state.clients.clientDetail);

    const initialSaleState = {
        client: '',
        paymentMethod: '',
        installments: '',
        soldAt: '',
        discount: '',
        paymentFee: '',
        products: [],
        debtAmount: '',
        shipment: null
    };

    const [newSale, setNewSale] = useState(initialSaleState);
// console.log(newSale);

    //STATE CLIENT:
    const [searchClient, setSearchClient] = useState('');
    const [filteredClients, setFilteredClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showClientDropdown, setShowClientDropdown] = useState(false);

    //STATE PRODUCT:
    const [searchProduct, setSearchProduct] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [filteredProductOptions, setFilteredProductOptions] = useState([]);
    const [selectedProductQuantities, setSelectedProductQuantities] = useState({});
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    //STATE SHIPMENT
    const [withShipping, setWithShipping] = useState(false);
    const [selectedAddressOption, setSelectedAddressOption] = useState(null);
    const [shipment, setShipment] = useState({ address: '', amount: '' });
    const [clientOptions, setClientOptions] = useState([]);
    const [selectKey, setSelectKey] = useState(Date.now());
    const [showShipmentDropdown, setShowShipmentDropdown] = useState(false);
// console.log(shipment);

    // const handleSetForm = () => {
    //     setIsSubmitDisabled(true);
    //     setNewSale(initialSaleState);
    //     setSelectedClient(null);
    //     setPaymentMethod(null);
    //     setSelectedProducts([{ productId: null, colorId: null, sizeId: null, price: null, category: null }]);
    //     setSubtotal(0);
    //     setIsClearDisabled(true);
    //     setWithShipping(false);
    //     setShipment({ address: '', amount: '' });
    //     setSelectedAddressOption(null);
    //     setNewDebt(false);
    // };

    useEffect(() => {
        if (searchClient.trim() === '') {
            setFilteredClients([]);
            return;
        }

        const filtered = clients.filter((client) =>
            (`${client.dni} ${client.name} ${client.lastname}`)
                .toLowerCase()
                .includes(searchClient.toLowerCase())
        );

        setFilteredClients(filtered);
    }, [searchClient, clients]);

    useEffect(() => {
        if (!searchProduct.trim()) {
            setFilteredProductOptions([]);
            return;
        }

        const options = transformProductOptions(products, selectedProductQuantities);

        const filtered = options.filter(option =>
            option.label.toLowerCase().includes(searchProduct.toLowerCase()) ||
            option.productId.toLowerCase().includes(searchProduct.toLowerCase())
        );

        setFilteredProductOptions(filtered);
    }, [searchProduct, products, selectedProductQuantities]);

    //CLIENT
    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setSearchClient(`${client.dni} - ${client.name} ${client.lastname}`);
        setShowClientDropdown(false);

        // Guardar en la venta
        setNewSale((prev) => ({
            ...prev,
            client: client._id,
            shipment: null,
            // debtAmount: "" 
        }));

        Keyboard.dismiss();

        // setNewDebt(false); 
        setWithShipping(false);
        setSelectedAddressOption(null);
    };

    const transformClientOptions = (clients) => {
        const clientOptions = clients?.map(client => ({
            value: client._id,
            label: `${client.dni} - ${client.name} ${client.lastname}`
        }));
        clientOptions.unshift({ value: '', label: 'Anónimo' });
        return clientOptions;        
    };

    useEffect(() => {
        if (selectedClient?._id) {
            dispatch(getClientById(selectedClient?._id));
        }
        setClientOptions(transformClientOptions(clients));
        setSelectKey(Date.now());
    }, [clients, selectedClient]);

    //PRODUCT
    const transformProductOptions = (products, selectedQuantities) => {
        const options = [];

        products.forEach(product => {
            product.color.forEach(color => {
                color.size.forEach(size => {
                    const key = `${product._id}_${color._id}_${size._id}_${product.price}`;
                    const selectedQuantity = selectedQuantities[key] || 0;
                    const availableStock = size.stock - selectedQuantity;

                    if (availableStock > 0) {
                        options.push({
                            productId: product._id,
                            colorId: color._id,
                            sizeId: size._id,
                            label: `${product.name} - ${color.colorName} - Talle ${size.sizeName} - $${product.price}`,
                            price: product.price,
                            stock: availableStock,
                            category: product.category?.[0]?.name || '',
                            key, // para simplificar manejo de cantidades
                        });
                    }
                });
            });
        });

        return options;
    };

    const handleProductAdd = (option) => {
        if (!option) return;

        Keyboard.dismiss();

        setSelectedProducts(prev => [
            ...prev,
            {
                ...option,
                tempId: `${option.productId}_${Date.now()}`
            }
        ]);

        setSelectedProductQuantities(prev => ({
            ...prev,
            [option.key]: (prev[option.key] || 0) + 1
        }));

        setSearchProduct('');
        setFilteredProductOptions([]);
        setShowProductDropdown(false);
    };

    const handleRemoveProduct = (index) => {
        setSelectedProducts(prev => prev.filter((_, i) => i !== index));
    };
    
    //SHIPMENT
    const toggleWithShipping = (value) => {
        setWithShipping(value);

        if (!value) {
            setShowShipmentDropdown(false);
            setSelectedAddressOption(null);
            setShipment({ address: '', amount: '' });
            setNewSale(prev => ({ ...prev, shipment: null }));
        }
    };

    const formatAddress = (address) => {
        if (!address) return '';

        const parts = [
            address.name,
            address.street ? `Calle: ${address.street}` : null,
            address.number ? `N° ${address.number}` : null,
            address.between ? `E/ ${address.between}` : null,
            address.floor ? `Piso: ${address.floor}` : null,
            address.apartment ? `Dpto: ${address.apartment}` : null,
            address.city ? `Ciudad: ${address.city}` : null,
            address.postalCode ? `CP: ${address.postalCode}` : null,
            address.province ? `Provincia: ${address.province}` : null,
            address.reference ? `Referencia: ${address.reference}` : null,
        ];

        return parts.filter(Boolean).join(', ');
    };

    const getClientAddressOptions = () => {
        
        if (!clientById?.addresses?.length) return [];

        return clientById.addresses?.map(address => ({
            value: address._id,
            label: formatAddress(address),
            fullAddress: address
        }));
    };

    const handleAddressChange = (selectedOption) => {
        if (!selectedOption) return;


        const address = selectedOption.fullAddress;

        setSelectedAddressOption(selectedOption);

        setShipment(prev => ({
            ...prev,
            address: formatAddress(address),
        }));

        setShowShipmentDropdown(false);

        Keyboard.dismiss();
    };

    //DEBT
    // const toggleNewDebt = (value) => {
    //     setNewDebt(value);
    //     setNewSale(prev => ({
    //         ...prev,
    //         debtAmount: ""
    //     }));
    // };

    return (
        <Wrapper
            {...(Platform.OS !== 'web' && {
            onPress: () => {
                Keyboard.dismiss();
                setShowClientDropdown(false);
                setShowProductDropdown(false);
            }
            })}
        >
        <View style={styles.container}>
            <View style={{ position: 'relative', zIndex: 10 }}>
                <Text style={styles.label}>Cliente</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Buscar cliente por DNI o nombre"
                    value={searchClient}
                    onChangeText={(text) => {
                        setSearchClient(text);
                        setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                />
                {showClientDropdown && filteredClients?.length > 0 && (
                    <FlatList
                        style={styles.dropdown}
                        contentContainerStyle={{ zIndex: 1000 }}
                        data={filteredClients}
                        keyExtractor={(item) => item._id}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <Pressable
                                style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                                onPressIn={() => {
                                    Keyboard.dismiss();
                                    handleSelectClient(item);
                                }}
                            >
                                <Text>{`${item.dni} - ${item.name} ${item.lastname}`}</Text>
                            </Pressable>
                        )}
                    />
                )}
            </View>
            <View style={{ position: 'relative', zIndex: 9 }}>
                <Text>Con envío</Text>
                <Switch
                    value={withShipping}
                    onValueChange={toggleWithShipping}
                    disabled={!selectedClient}
                />
                {withShipping && (
                    <>
                        <Text style={styles.label}>Dirección de envío</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Seleccionar"
                            value={selectedAddressOption?.label ?? ''}
                            onChangeText={(text) => {
                                setSelectedAddressOption(text);
                                setShowShipmentDropdown(true);
                            }}
                            onFocus={() => setShowShipmentDropdown(true)}
                        />
                        {showShipmentDropdown && (
                            <FlatList
                                style={styles.dropdown}
                                contentContainerStyle={{ zIndex: 1000 }}
                                data={getClientAddressOptions()}
                                keyExtractor={(item) => item.value}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                                        onPressIn={() => {
                                            Keyboard.dismiss();
                                            handleAddressChange(item);
                                        }}
                                    >
                                        <Text>{item.label}</Text>
                                    </Pressable>
                                )}
                                // ListEmptyComponent={<Text>No tiene direcciones registradas</Text>}
                                ListEmptyComponent={() => (
                                    <Pressable
                                        style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                                        onPressIn={() => {
                                            Keyboard.dismiss();
                                        }}
                                    >
                                        <Text>No tiene direcciones registradas</Text>
                                    </Pressable>
                                )}
                            />
                        )}
                        <Text style={styles.label}>Costo de envío</Text>
                        <TextInput
                            style={styles.input}
                            value={shipment.amount ? shipment.amount : ''}
                            onChangeText={(text) => setShipment(prev => ({ ...prev, amount: text }))}
                            placeholder="0"
                            keyboardType="number-pad"
                            editable={withShipping && selectedAddressOption !== null}
                        />
                    </>
                )}
            </View>
            <View style={{ position: 'relative', zIndex: 8 }}>
                <Text style={styles.label}>Productos</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Buscar producto"
                    value={searchProduct}
                    onChangeText={(text) => {
                        setSearchProduct(text);
                        setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                />
                {showProductDropdown && filteredProductOptions?.length > 0 && (
                    <FlatList
                        style={styles.dropdown}
                        contentContainerStyle={{ zIndex: 1000 }}
                        data={filteredProductOptions}
                        keyExtractor={(item) => item.tempId || item.key}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <Pressable
                                style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                                onPressIn={() => {
                                    Keyboard.dismiss();
                                    handleProductAdd(item);
                                }}
                            >
                                <Text>{item.label}</Text>
                            </Pressable>
                        )}
                    />
                )}
                {selectedProducts?.length > 0 && (
                    <FlatList
                        data={selectedProducts}
                        keyExtractor={(item) => item.tempId}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item, index }) => (
                            <View style={styles.selectedProduct}>
                                <Text>{item.label}</Text>
                                <Pressable  onPress={() => handleRemoveProduct(index)}>
                                    <Text style={styles.remove}>❌</Text>
                                </Pressable >
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 12,
        borderRadius: 4
    },
    dropdown: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderWidth: 1,
        borderColor: '#ccc',
        maxHeight: 200,
        marginTop: 5,
        borderRadius: 5,
        backgroundColor: '#fff'
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    selectedProduct: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    remove: {
        color: 'red',
        fontWeight: 'bold'
    },

});

export default NewSale;
