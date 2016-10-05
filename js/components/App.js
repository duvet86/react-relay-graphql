import React from 'react';

const App = (props) => (
	<div>
		{props.children}
	</div>
);

// App.propTypes = { 
// 	params: PropTypes.shape({
// 		id: PropTypes.string
// 	})
// };

export default App;