import axios from 'axios';
import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// import { food_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = import.meta.env.VITE_API_URL || 'https://food-del-backend-p7zz.onrender.com';

  const [food_list, setFoodList] = useState([]);

  const [token, setToken] = useState('');

  const [showLogin, setShowLogin] = useState(false)

//   const addToCart = async(itemId) => {
//     if (!cartItems[itemId]) {
//       setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
//     } else {
//       setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
//     }
//     if (token){
//       await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
//   }
// };

const addToCart = async (itemId) => {
  if (!cartItems) return; // Safety check
  
  let updatedCart;
  if (!cartItems[itemId]) {
    updatedCart = { ...cartItems, [itemId]: 1 };
  } else {
    updatedCart = { ...cartItems, [itemId]: cartItems[itemId] + 1 };
  }
  setCartItems(updatedCart);

  if (!token) {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  }

  if (token) {
    await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
  }
};

// const removeFromCart = async(itemId) => {
//     setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))  
//     if (token) {
//         await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
//     }
// }  
const removeFromCart = async (itemId) => {
  if (!cartItems) return; // Safety check
  
  let updatedCart;
  if (cartItems[itemId] === 1) {
    updatedCart = { ...cartItems };
    delete updatedCart[itemId];
  } else {
    updatedCart = { ...cartItems, [itemId]: cartItems[itemId] - 1 };
  }
  setCartItems(updatedCart);

  

  if (!token) {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  }

  if (token) {
    await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
  }
};
const getTotalCartAmount=()=>{
  if (!cartItems) return 0; // Safety check
  
  let totalAmount =0;
  for(const item in cartItems)
      {
          if(cartItems[item]>0){
          let itemInfo=food_list.find((product)=>product._id===item)
          if (itemInfo) { // Safety check for itemInfo
            totalAmount+=itemInfo.price*cartItems[item];
          }
          }
      }
      return totalAmount;
}


  const fetchFoodList=async ()=>{
    try {
      const response= await axios.get(url+"/api/food/list")
      console.log("Food list response:", response.data);
      if (response.data.success && response.data.data) {
        setFoodList(response.data.data)
        console.log("Food list loaded:", response.data.data.length, "items");
      } else {
        console.error("Failed to fetch food list:", response.data);
        setFoodList([]);
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      setFoodList([]);
    }
}

const loadCartData = async (token) => {
  try {
    const response = await axios.post(url+"/api/cart/get",{},{headers:{token}});
    setCartItems(response.data.cartData);
  } catch (error) {
    console.error("Error loading cart:", error);
    // If token is invalid, clear it and reset cart
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
  }
}

// 🟢 Merge local cart with backend cart when user logs in
  const mergeLocalCartWithBackend = async (token) => {
    try {
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        const parsedCart = JSON.parse(localCart);

        // Local cart items ko backend mai add karo
        for (const itemId in parsedCart) {
          const quantity = parsedCart[itemId];
          for (let i = 0; i < quantity; i++) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
          }
        }

        // Backend se fresh cart fetch karo
        await loadCartData(token);

        // localStorage cart clear karo
        localStorage.removeItem("cart");
      }
    } catch (error) {
      console.error("Error merging cart:", error);
      // On error, just clear local cart and use backend cart
      localStorage.removeItem("cart");
    }
  };



  // useEffect(() => {
  //   async function loadData() {
  //     await fetchFoodList();
  //     if (localStorage.getItem('token')) {
  //       setToken(localStorage.getItem('token'));
  //       await loadCartData(localStorage.getItem("token"));
  //     }
  //   }
  //   loadData();
  // }, []);

 // 🟢 First load: food list + cart
  useEffect(() => {
    async function loadData() {
      try {
        await fetchFoodList();
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          setToken(savedToken);
          await loadCartData(savedToken);
        } else {
          // login nahi hai to localStorage se cart load karo
          const localCart = localStorage.getItem("cart");
          if (localCart) {
            setCartItems(JSON.parse(localCart));
          } else {
            setCartItems({}); // empty object so nothing breaks
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setCartItems({}); // Ensure cartItems is always defined
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (token) {
      mergeLocalCartWithBackend(token);
    }
  }, [token]);

  const contextValue = {  
    food_list,  
    cartItems,  
    setCartItems,  
    addToCart,  
    removeFromCart  ,
    getTotalCartAmount,
    url,
    token,
    setToken,
     showLogin,
        setShowLogin,

} 
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

StoreContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StoreContextProvider;
