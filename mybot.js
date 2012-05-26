var last_target = null;

function new_game() {
  var board = get_board();
  
  var fruits = {};
  
  //Create lookup of all available fruits
  for (var x = 0, xl = board.length; x < xl; x += 1) {
    for (var y = 0, yl = board[x].length; y < yl; y += 1) {
      if (board[x][y] > 0) {
        //Build fruit lookup
        if (typeof(fruits[board[x][y]]) === 'undefined') {
          fruits[board[x][y]] = [];
        }
        fruits[board[x][y]].push([x,y]);        
      }
    }
  }
}

function make_move() {
   var board = get_board();
   var my_x = get_my_x();
   var my_y = get_my_y();
   
   // Calculate coordinates to ignore
   var ignore_coords = [];
   for(var i = 1; i < 5; i += 1) {
     var my_items = get_my_item_count(i);
     var o_items = get_opponent_item_count(i);
     var total_items = get_total_item_count(i);
     
     if (Math.floor(total_items / 2) < my_items || Math.floor(total_items / 2) < o_items) {
       //Someone has more than half of this item, ignore all of these.
       for (var x = 0, xl = board.length; x < xl; x += 1) {
         for (var y = 0, yl = board[x].length; y < yl; y += 1) {
           if (board[x][y] === i) {
             ignore_coords.push([x,y]);
           }
         }
       }
     }
   }
      
   // find closest fruit
   var target = find_highest_priority_fruit({
     ignore: ignore_coords
   });
   
   last_target = target;

   // we found an item! take it!
   if (board[my_x][my_y] > 0) {
      //See if this is an ignore coordinate
      var skip = false;
      for (var i = 1, l = ignore_coords.length; i < l; i += 1) {
        if ([my_x, my_y] === ignore_coords[i]) {
          skip = true;
        }
      }
      
      if (skip === false) {
        return TAKE;
      }
   }
   
   if (my_y > target[1]) {
     return NORTH;
   }
   
   if (my_y < target[1]) {
     return SOUTH;
   }
   
   if (my_x < target[0]) {
     return EAST;
   }
   
   if (my_x > target[0]) {
     return WEST;
   }

   return PASS;
}

function find_highest_priority_fruit(args) {
  var board = get_board();
  var prioritized_board = [];
  
  for (var x = 0, xl = board.length; x < xl; x += 1) {
    for (var y = 0, yl = board[x].length; y < yl; y += 1) {
      if(board[x][y] > 0) {
        var skip = false;
        
        if (typeof(args) !== 'undefined' && typeof(args['ignore']) !== 'undefined') {
          for(var i = 0, l = args['ignore'].length; i < l; i += 1) {
            if ([x,y] === args['ignore'][i]) {
              skip = true;
              break;
            }
          }
        }
        
        if(skip === false) {
          var coord = {
            'coord': [x,y],
            'distance': distance_to_coord(x,y),
            'rarity': get_total_item_count(board[x][y]) - get_opponent_item_count(board[x][y]) - get_my_item_count(board[x][y])
          };

          if (typeof(board[x+1]) !== 'undefined' && board[x+1] > 0) {
            coord['closest_fruit'] = 1;
          }

          if (typeof(board[x-1]) !== 'undefined' && board[x-1] > 0) {
            coord['closest_fruit'] = 1;
          }

          if (typeof(board[y+1]) !== 'undefined' && board[y+1] > 0) {
            coord['closest_fruit'] = 1;
          }

          if (typeof(board[y-1]) !== 'undefined' && board[y-1] > 0) {
            coord['closest_fruit'] = 1;
          }

          prioritized_board.push(coord);
        }
      }
    }
  }
  
  prioritized_board.sort(function(a,b) { return a.closest_fruit - b.closest_fruit });
    
  prioritized_board.sort(function(a,b) { return a.distance - b.distance });
  
  prioritized_board.sort(function(a,b) { return a.rarity - b.rarity });
  
  //See if the second highest priority coordinate is the last target, to prevent jumping, and replace
  if (typeof(prioritized_board[1]) !== 'undefined' && last_target === prioritized_board[1]['coord']) {
    return prioritized_board[1]['coord'];
  }
  
  return prioritized_board[0]['coord'];
}

function distance_to_coord(x,y) {
  var total_x = 0;
  var total_y = 0;
  
  var my_x = get_my_x();
  var my_y = get_my_y();
  
  if (x > my_x) {
    total_x += (x - my_x);
  }
  
  if (x < my_x) {
    total_x += (my_x - x);
  }
  
  if (y > my_y) {
    total_y += (y - my_y);
  }
  
  if (y < my_y) {
    total_y += (my_y - y);
  }
  
  return total_x + total_y;
}