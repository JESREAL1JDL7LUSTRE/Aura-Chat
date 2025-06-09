import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NotificationType } from "@prisma/client";

export async function notifyFriendRequest(
  userId: string,
  friendId: string,
  action: "REQUEST" | "ACCEPT" | "REJECT"
) {
  if (!userId || !friendId || !action) {
    return NextResponse.json(
      { error: "User ID, Friend ID, and action are required" },
      { status: 400 }
    );
  }

  try {
    let notificationType: NotificationType;
    let title: string;
    let content: string;
    let recipientId: string;

    // Determine notification details based on action
    switch (action) {
      case "REQUEST":
        notificationType = NotificationType.SENT_FRIEND_REQUEST;
        title = "New Friend Request";
        content = "Someone sent you a friend request";
        recipientId = friendId; // Friend receives the notification
        break;
      case "ACCEPT":
        notificationType = NotificationType.FRIEND_REQUEST_ACCEPTED;
        title = "Friend Request Accepted";
        content = "Your friend request was accepted";
        recipientId = userId; // Original sender receives the notification
        break;
      case "REJECT":
        // You might want to add a FRIEND_REQUEST_REJECTED type to your enum
        // For now, using OTHER or you can skip notification for rejections
        return NextResponse.json({ message: "No notification sent for rejection" });
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: recipientId,
        type: notificationType,
        title,
        content,
        senderId: action === "REQUEST" ? userId : friendId,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, friendId, action } = body;

    if (!userId || !friendId || !action) {
      return NextResponse.json(
        { error: "User ID, Friend ID, and action are required" },
        { status: 400 }
      );
    }

    return await notifyFriendRequest(userId, friendId, action);
  } catch (error) {
    console.error("Error in POST /api/notification:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}