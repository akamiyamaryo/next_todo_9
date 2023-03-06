import {
  Box,
  Button,
  Heading,
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import styled from "@emotion/styled";
import { collection, doc, getDoc, getDocs, setDoc, Timestamp, query, where, orderBy, CollectionReference } from "firebase/firestore";
import { db } from "@/libs/firebase";
import { formatDateStr } from "@/utils";
import Link from 'next/link';

function TodoShow() {
  const router = useRouter();
  const id = router.query.id as string;

  type todos = {
    title: string;
    detail: string;
    create: string;
    update: string;
  };


  type comments = {
    uid: string
    todoid: string,
    comid: string,
    uname: string,
    comdetail: string,
    create: Timestamp
  };

  const [todos, setTodos] = useState<todos>({ title: "", detail: "", create: "", update: "" });
  const [comments, setComments] = useState<comments[]>([]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [uname, setUname] = useState<string>("");
  const [comdetail, setComdetail] = useState<string>("");


  const fetchComment = async () => {
    const commentCollection = collection(db, "comment") as CollectionReference<comments>;
    const commentQuery = query(commentCollection, where("todoid", "==", id), orderBy("create", "desc"));
    const commentDocsSnap = await getDocs(commentQuery);

    const commentList: comments[] = [];
    commentDocsSnap.forEach((doc) => {
      commentList.push(doc.data());
    });

    setComments(commentList);
  }

  const addComment = async () => {
    try {
      const newComment = doc(collection(db, "comment"));
      await setDoc(newComment,
        {
          uid: null,
          todoid: id,
          comid: newComment.id,
          uname: uname,
          comdetail: comdetail,
          create: Timestamp.now(),
        }
      );

      onClose();
      fetchComment();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    if (id) {
      (async () => {
        const todoDocRef = doc(db, "todoposts", id);
        const todoDocSnap = await getDoc(todoDocRef);
        const todoDocObj = todoDocSnap.data();

        if (todoDocObj) {
          const create = formatDateStr(todoDocObj.create.seconds);
          const update = formatDateStr(todoDocObj.update.seconds);

          setTodos({
            title: todoDocObj.title,
            detail: todoDocObj.detail,
            create,
            update,
          });
        }
      })();

      fetchComment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return (
    <Layout>
      <Box
        width="1080px"
        margin="0 auto"
      >
        <D1_HEAD>
          <Heading
            width="200px"
            height="33px"
            fontSize="2xl"
            fontFamily="Roboto"
            fontStyle="normal"
            fontWeight="700"
          >
            SHOW TODO
          </Heading>
          <Box>
            <Button
              onClick={onOpen}
              background="#28ADCA"
              border="1px solid rgba(0, 0, 0, 0.8)"
              box-sizing="border-box"
              margin="24px 16px 0px 0px"
              width="112px"
              height="40px"
              borderRadius="50px"
            >
              <P1>Comment</P1>
            </Button>
            <Link href="/">
              <Button
                background="#95E3F4"
                border="1px solid rgba(0, 0, 0, 0.8)"
                box-sizing="border-box"
                margin="24px 0px 0px 0px"
                borderRadius="50px"
                width="112px"
                height="40px"
              >
                <P2>Back</P2>
              </Button>
            </Link>
          </Box>
        </D1_HEAD>
        <main>
          <D1>
            <D2>
              <Box margin="10px">
                <P3>TITLE</P3>
                <P4>{todos.title}</P4>
                <P3>DETAIL</P3>
                <P5>
                  {todos.detail}
                </P5>
                <Box display="flex">
                  <Link href={`/${id}/todoedit`}>
                    <Button
                      width="112px"
                      height="40px"
                      background="#95E3F4"
                      border="1px solid #000000"
                      borderRadius="50px"
                      margin="18px 48px 0px 0px"
                    >
                      <P6>Edit</P6>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 19 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.1396 6.02L12.0648 6.94L2.95277 16H2.02749V15.08L11.1396 6.02ZM14.7602 0C14.5088 0 14.2473 0.1 14.0562 0.29L12.2157 2.12L15.9873 5.87L17.8278 4.04C18.22 3.65 18.22 3.02 17.8278 2.63L15.4743 0.29C15.2732 0.09 15.0217 0 14.7602 0ZM11.1396 3.19L0.0159912 14.25V18H3.78754L14.9111 6.94L11.1396 3.19Z"
                          fill="black"
                          fillOpacity="0.8"
                        />
                      </svg>
                    </Button>
                  </Link>
                  <Box margin="16px 48px 0px 0px">
                    <P7>Create</P7>

                    <P9>{todos.create}</P9>
                  </Box>
                  <Box marginTop="16px">
                    <P8>Update</P8>
                    <P9>{todos.update}</P9>
                  </Box>
                </Box>
              </Box>
            </D2>
            <Box marginTop="14px" width="472px">
              {comments.map((comment: comments) => (
                <D3 key={comment.comid}>
                  <D4>
                    <P10>{comment.uname}</P10>
                    <P11>{formatDateStr(comment.create.seconds)}</P11>
                  </D4>
                  <P12>{comment.comdetail}</P12>
                </D3>
              ))}
            </Box>
          </D1>
        </main>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent
            width={"400px"}
            height={"434px"}
          >
            <ModalHeader
              fontWeight={"bold"}
              fontSize={"36px"}
            >Comment</ModalHeader>
            <ModalBody
              padding={"0"}
              margin={"0 auto"}
            >
              <Box
                marginBottom={"9px"}
              >
                <SModal_Label>Name</SModal_Label>
                <SModal_Input type="text" onChange={(event) => setUname(event.target.value)} />
              </Box>
              <SModal_Label>Your Comment</SModal_Label>
              <SModal_Textarea onChange={(event) => setComdetail(event.target.value)} />
            </ModalBody>
            <Box
              margin={"0 auto"}
              marginTop={"7px"}
              marginBottom={"10px"}
            >
              <SModal_Button
                onClick={addComment}
              >
                CREATE
              </SModal_Button>
            </Box>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
}

export default TodoShow;

const D1 = styled.div`
  display: flex;
  justify-content: space-between;
`;
const D1_HEAD = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;
const D2 = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.8);
  border-radius: 20px;
  margin: 0px 23px 0px 0px;
`;
const D3 = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.8);
  border-radius: 20px;
  margin-bottom: 26px;
`;
const D4 = styled.div`
  display: flex;
  background: #28adca;
  height: 28px;
  border-radius: 20px 20px 0px 0px;
`;
const P1 = styled.p`
  font-family: Gothic A1;
  font-style: normal;
  font-size: 16px;
  font-weight: 700;
  color: #f0fcff;
  width: 83px;
  height: 23px;
  text-align: center;
`;
const P2 = styled.p`
  width: 43px;
  height: 23px;
  font-family: Gothic A1;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
`;
const P3 = styled.p`
  width: 560px;
  height: 28px;
  background: #95e3f4;
  font-size: 24px;
  font-family: Roboto;
  font-style: normal;
  font-weight: 700;
  boxshadow: 0px 1px 0px rgba(0, 0, 0, 0.25);
  align-items: center;
  display: flex;
`;
const P4 = styled.p`
  width: 560px;
  height: 33px;
  font-size: 20px;
  font-family: Roboto;
  font-style: normal;
  font-weight: 700;

  align-items: center;
  margin-bottom: 16px;
`;
const P5 = styled.p`
  width: 560px;
  height: 263px;
  font-size: 20px;
  font-family: Roboto;
  font-style: normal;
  font-weight: 700;
  line-height: 23px;
  align-items: center;
  display: center;
`;
const P6 = styled.p`
  margin-right: 11px;
  width: 35px;
  height: 23px;
  font-family: Gothic A1;
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
`;
const P7 = styled.p`
  font-size: 16px;
  width: 60px;
  height: 20px;
  font-family: Gothic A1;
  font-style: normal;
  font-weight: 700;
`;
const P8 = styled.p`
  font-size: 16px;
  width: 70px;
  height: 20px;
  font-family: Gothic A1;
  font-style: normal;
  font-weight: 700;
`;
const P9 = styled.p`
  font-size: 18px;
  width: 175px;
  height: 25px;
  font-family: Gothic A1;
  font-style: normal;
  font-weight: 700;
`;
const P10 = styled.p`
  width: 95px;
  height: 19px;
  font-size: 16px;
  color: #f0fcff;
  margin: 3px 242px 4px 24px;
  font-family: Roboto;
  font-style: normal;
  font-weight: 700;
`;
const P11 = styled.p`
  width: 100px;
  height: 19px;
  color: #f0fcff;
  font-size: 14px;
  margin: 3px 0px 0px;
  font-family: Roboto;
  font-style: normal;
  font-weight: 700;
`;
const P12 = styled.p`
  width: 440px;
  height: 64px;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.8);
  font-family: Roboto;
  font-style: normal;
  font-weight: 700;
  margin: 5px 15px 0px;
`;
const P13 = styled.div`
  width: 560px;
  height: 300px;
  font-size: 20px;
  font-family: Roboto;
  font-style: normal;
  font-weight: 700;
  white-space: pre-line;
`;

const SModal_Label = styled.div`
height: 23px;
font-weight: 700;
font-size: 18px;
line-height: 22px;
color: rgba(0, 0, 0, 0.8);
`;

const SModal_Input = styled(Input)`
width: 372px;
border: 1px solid rgba(0, 0, 0, 0.8);
`;

const SModal_Textarea = styled(Textarea)`
width: 372px;
height:192px;
border: 1px solid rgba(0, 0, 0, 0.8);
`;

const SModal_Button = styled(Button)`
width: 372px;
height: 43px;
background: #28ADCA;
border: 1px solid rgba(0, 0, 0, 0.8);
border-radius: 10px;
color: #F0FCFF;
`;