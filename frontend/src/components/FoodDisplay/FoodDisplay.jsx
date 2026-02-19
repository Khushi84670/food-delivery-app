import React, { useContext } from 'react'
import styles from './FoodDisplay.module.css'
// import { food_list } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

import FoodItem from '../Fooditem/FoodItem';
function FoodDisplay({category}) {

  const {food_list}=useContext(StoreContext)

  console.log("FoodDisplay - food_list:", food_list);

  return (
    <div className={styles.foodDisplay} id={styles.foodDisplay}>


      <h2>Top dishes near you</h2>

      <div className={styles.foodDisplayList}>
        {!food_list || food_list.length === 0 ? (
          <p>Loading dishes...</p>
        ) : (
          food_list.map((item, index)=>{
            // console.log(category,item.category);
            // console.log( food_list);
            
            if (category==="All" || category===item.category) {
              return <FoodItem key={index} id={item._id} name={item.name} description={item.description} price={item.price} image={item.image}  />
            }
          })
        )}
      </div>
       
    </div>
  )
}

export default FoodDisplay
