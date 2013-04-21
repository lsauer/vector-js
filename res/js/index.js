	var menu_forkit = document.querySelector('#menu-forkit');
	menu_forkit.onmouseover = function(e){
			document.querySelector('.forkicon').className = "forkicon forkicon-hover";
	}; 
	menu_forkit.onmouseout = function(e){
			document.querySelector('.forkicon').className = "forkicon";
	};
	$(function(){
		$('#tablecalc').click(
			function(){
				//collect the current vector values from the TryIt Demo
				var arrvals = new Array(
					 $('#testvector1').val().split(/,/).map( function(e,i,a){return e|0;})
					,$('#testvector2').val().split(/,/).map( function(e,i,a){return e|0;})
					,$('#testvector3').val().split(/,/).map( function(e,i,a){return e|0;})
				);
				//create a set of vectors form the extracted values
				var arrvects = new Array(
					 vectorop.Vector(arrvals[0]) 
					,vectorop.Vector(arrvals[1]) 
					,vectorop.Vector(arrvals[2]) 
				);
				//collect the set operators from the TryIt Demo
				var arranglsphi = new Array(
					 arrvects[0].spherical().p * vectorop.RADIAN
					,arrvects[1].spherical().p * vectorop.RADIAN
					,arrvects[2].spherical().p * vectorop.RADIAN
				);
				//collect the set operators from the TryIt Demo
				var arrops =[];
				$('.vectorop').each( function(i,e){arrops.push(e.value);} )
				
				//calculate and set the angle of the vector in 2d; theta-angle and 3d projection are disregarded
				 $('.resultarrow1').css( {'-webkit-transform':'rotate(' + arranglsphi[0] +'deg)'} ); 
				 $('.resultarrow2').css( {'-webkit-transform':'rotate(' + arranglsphi[1] +'deg)'} ); 
				 $('.resultarrow3').css( {'-webkit-transform':'rotate(' + arranglsphi[2] +'deg)'} ); 
				 				
				//calculate the result
				var calcresult =eval('('+arrops[0] + (+arrvects[0])
										+arrops[1] + (+arrvects[1]) 
										+arrops[2] + (+arrvects[2]) 
									+')'+arrops[3] + $('#testscalar').val()
				);
				var vectresult = vectorop.Vector( 
					 calcresult | 0 //'floor' any floating number
				);
				 
				$('#calcResult').attr('value', vectresult.toString(true) );
				$('.resultarrow4').css( {'-webkit-transform':'rotate(' + (vectresult.spherical().p * vectorop.RADIAN) +'deg)'} ); 
			}
		);
		

	});
