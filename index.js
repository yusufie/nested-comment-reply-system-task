// create a input for main comment
const mainInput = document.getElementById("mainInput");

// create a comment list
const mainCommentList = document.getElementById("mainCommentList");

// create a new comment into main
let addComment = () => {
	if (!localStorage.getItem("comments")) {
		let comments = [];
		localStorage.setItem("comments", JSON.stringify(comments));
	}

	comments = JSON.parse(localStorage.getItem("comments"));
	comments.push({
		parentCommentId: null,
		commentId: Math.random()
			.toString()
			.substring(2, 7),
		commentText: mainInput.value,

		// create time for each comment
		createdTime: new Date().toLocaleString(),

		// create user for each comment
		createdBy: "User" +
			Math.random()
				.toString()
				.substring(2, 7),
				
		childComments: [],
		Likes: 0
	});
	localStorage.setItem("comments", JSON.stringify(comments));
	mainInput.value = "";
	renderComments();
};

// create a reply button
let createReplyButton = (id, inputType, commentOldData) => {
	let replyButton = document.createElement("div");
	replyButton.setAttribute("data-parentId", id);
	replyButton.innerHTML = 
		`<input type="text" value="${inputType === "update Comment" ? commentOldData : ""}"> 
		<a href="#">${inputType}</a>`;
	return replyButton;
};


// create a comment card
let createCommentCard = (obj, padding) => `
    <div class="CommentCard" data-parentId="${obj.parentCommentId}" id="${obj.commentId}" style="margin-left: ${padding}px; ">
    	${obj.commentText}
		<br>

        <a class="like" >Likes
			<i class='bx bx-like' ></i>
		</a>
			<span style="color: rgb(0, 0, 250)"> ${obj.Likes === 0 ? "" : obj.Likes}</span> &nbsp;
			
        <a class="reply" >Reply
			<i class='bx bx-reply' ></i>
		</a>
			<span style="color: rgb(250, 100, 0)"> ${obj.childComments.length === 0 ? "" : obj.childComments.length}</span> &nbsp;
        
		<a class="edit" > Edit
			<i class='bx bx-edit' ></i>
		</a> &nbsp;
			
        <a class="delete" > Delete 
			<i class='bx bx-trash' ></i>
		</a> &nbsp;

		<div class="createdByTime">
			<p>comment has been created: ${obj.createdTime} &nbsp; ${obj.createdBy}</p>
		</div>

    </div>
    `;

// create a view for nested comment children
let recursiveCommentsList = (mainCommentList, padding = 0) => {
	let fullComments = "";
	for (let i of mainCommentList) {
		fullComments += createCommentCard(i, padding);
		if (i.childComments.length > 0) {
			fullComments += recursiveCommentsList(i.childComments, (padding += 20));
			padding -= 20;

		}
	}
	return fullComments;
};
// increase the likes
let recursiveLikes = (allComments, newCommentLikeId) => {
	for (let i of allComments) {
		if (i.commentId === newCommentLikeId) {
			i.Likes += 1;
		} else if (i.childComments.length > 0) {
			recursiveLikes(i.childComments, newCommentLikeId);

		}
	}
};

// render all the comments
let renderComments = () => {
	let getCommentsFromLocalStorage = JSON.parse(
		localStorage.getItem("comments")
	);
	if (getCommentsFromLocalStorage) {
		let allComments = recursiveCommentsList(getCommentsFromLocalStorage);
		mainCommentList.innerHTML = allComments;
	}
};

renderComments();

// push the new child comment
let addNewChildComment = (allComments, newComment) => {
	for (let i of allComments) {
		if (i.commentId === newComment.parentCommentId) {
			i.childComments.push(newComment);
		} else if (i.childComments.length > 0) {
			addNewChildComment(i.childComments, newComment);
		}
	}
};

// get all comments from local storage
let getAllComments = () => JSON.parse(localStorage.getItem("comments"));

// set comments object again in local storage
let setAllComments = allComments =>
	localStorage.setItem("comments", JSON.stringify(allComments));

// recursive method to update the comment
let editComment = (allComments, updatedCommentId, updatedCommentText) => {
	for (let i of allComments) {
		if (i.commentId === updatedCommentId) {
			i.commentText = updatedCommentText;
		} else if (i.childComments.length > 0) {
			editComment(i.childComments, updatedCommentId, updatedCommentText);
		}
	}
};

// delete a comment
let deleteComment = (allComments, newCommentId) => {
	for (let i in allComments) {
		if (allComments[i].commentId === newCommentId) {
			allComments.splice(i, 1);
		} else if (allComments[i].childComments.length > 0) {
			deleteComment(allComments[i].childComments, newCommentId);
		}
	}
};

// event listener 
mainCommentList.addEventListener("click", e => {
	if (e.target.className === "reply") {
		const parentId = !e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");
		const currentParentComment = e.target.parentNode;
		currentParentComment.appendChild(
			createReplyButton(parentId, "Add Comment")
		);
		e.target.style.display = "none";
		e.target.nextSibling.style.display = "none";
	} else if (e.target.innerText === "Add Comment") {
		const parentId = e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");
		const newAddedComment = {
			parentCommentId: parentId,
			createdTime: new Date().toLocaleString(),
			createdBy: "User" +
			Math.random()
				.toString()
				.substring(2, 7),
			commentId: Math.random()
				.toString()
				.substring(2, 7),
			commentText: e.target.parentNode.firstChild.value,
			childComments: [],
			Likes: 0
		};
		let getCommentsFromLocalStorage = getAllComments();
		addNewChildComment(getCommentsFromLocalStorage, newAddedComment);
		setAllComments(getCommentsFromLocalStorage);
		renderComments();
	} else if (e.target.className === "like") {
		let getCommentsFromLocalStorage = getAllComments();
		recursiveLikes(getCommentsFromLocalStorage, e.target.parentNode.id);
		setAllComments(getCommentsFromLocalStorage);
		renderComments();
	} else if (e.target.className === "edit") {
		const parentId = !e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");
		const currentParentComment = e.target.parentNode;

		const complateCommentText = e.target.parentNode.innerText;
		const commentToArray = complateCommentText.split(" ");
		const findIndexOfLikes = commentToArray.indexOf("Likes");
		const realComment = commentToArray.slice(0, findIndexOfLikes);

		currentParentComment.appendChild(
			createReplyButton(
				parentId,
				"update Comment",
				realComment.join(" ")
			)
		);
		e.target.style.display = "none";
	} else if (e.target.innerText === "update Comment") {
		const parentId = e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");

		let getCommentsFromLocalStorage = getAllComments();
		editComment(
			getCommentsFromLocalStorage,
			parentId,
			e.target.parentNode.firstChild.value
		);
		setAllComments(getCommentsFromLocalStorage);
		renderComments();
	} else if (e.target.className === "delete") {
		const parentId = e.target.parentNode.getAttribute("id");
		let getCommentsFromLocalStorage = getAllComments();
		deleteComment(getCommentsFromLocalStorage, parentId);
		setAllComments(getCommentsFromLocalStorage);
		renderComments();
	}
});
