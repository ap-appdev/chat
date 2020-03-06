import Chat from 'Views/chat/Chat'

// chat component
// const Chat = () => import('Views/chat/Chat');

export default {
   path: '/',
   component: Chat,
   meta: {
      requiresAuth: true,
      title: 'message.chat',
      breadcrumb: null
   }
}
// export default {
//    path: '/',
//    component: Full,
//    redirect: '/chat/chat',
//    children: [
//       {
//          path: '/chat/chat',
//          component: Chat,
//          meta: {
//             requiresAuth: true,
//             title: 'message.chat',
//             breadcrumb: null
//          }
//       }
//    ]
// }
