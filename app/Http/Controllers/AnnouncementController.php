<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    private function formatAnn(Announcement $a): array
    {
        $months = ['Jan'=>'Oca','Feb'=>'Şub','Mar'=>'Mar','Apr'=>'Nis','May'=>'May',
                   'Jun'=>'Haz','Jul'=>'Tem','Aug'=>'Ağu','Sep'=>'Eyl','Oct'=>'Eki','Nov'=>'Kas','Dec'=>'Ara'];
        return [
            'id'         => (string) $a->_id,
            'title'      => $a->title,
            'content'    => $a->content,
            'image_url'  => $a->image_url ?? null,
            'priority'   => $a->priority ?? 'normal',
            'date'       => $a->created_at ? strtr($a->created_at->format('d M Y'), $months) : '',
            'publisher'  => $a->published_by ?? '',
            'likes'      => (int) ($a->likes ?? 0),
            'reactions'  => $a->reactions ?? ['like'=>0,'love'=>0,'wow'=>0,'haha'=>0],
            'comments'   => $a->comments ?? [],
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $departmentId = $request->get('department_id');
        $limit        = (int) ($request->get('limit', 15));

        $query = Announcement::where('is_active', true)
            ->whereIn('target_audience', ['students', 'all']);

        if ($departmentId) {
            $query->where(function ($q) use ($departmentId) {
                $q->whereNull('department_id')
                  ->orWhere('department_id', (int) $departmentId);
            });
        }

        $announcements = $query->orderBy('created_at', 'desc')
            ->limit($limit)->get()
            ->map(fn($a) => $this->formatAnn($a));

        return response()->json(['success' => true, 'announcements' => $announcements]);
    }

    public function show(string $id): JsonResponse
    {
        $ann = Announcement::find($id);
        if (!$ann) {
            return response()->json(['success' => false, 'message' => 'Duyuru bulunamadı'], 404);
        }
        return response()->json(['success' => true, 'announcement' => $this->formatAnn($ann)]);
    }

    public function like(Request $request, string $id): JsonResponse
    {
        $studentNo = $request->get('student_no');
        $ann = Announcement::find($id);
        if (!$ann) return response()->json(['success' => false], 404);

        $likedBy = $ann->liked_by ?? [];
        if (in_array($studentNo, $likedBy)) {
            $likedBy = array_values(array_diff($likedBy, [$studentNo]));
            $ann->likes = max(0, (int)($ann->likes ?? 0) - 1);
            $liked = false;
        } else {
            $likedBy[] = $studentNo;
            $ann->likes = (int)($ann->likes ?? 0) + 1;
            $liked = true;
        }
        $ann->liked_by = $likedBy;
        $ann->save();

        return response()->json(['success' => true, 'likes' => $ann->likes, 'liked' => $liked]);
    }

    public function react(Request $request, string $id): JsonResponse
    {
        $studentNo = $request->get('student_no');
        $emoji     = $request->get('reaction'); // like|love|wow|haha
        $allowed   = ['like', 'love', 'wow', 'haha'];
        if (!in_array($emoji, $allowed)) {
            return response()->json(['success' => false, 'message' => 'Geçersiz tepki'], 422);
        }

        $ann = Announcement::find($id);
        if (!$ann) return response()->json(['success' => false], 404);

        $reactedBy = $ann->reacted_by ?? [];
        $reactions = $ann->reactions ?? ['like'=>0,'love'=>0,'wow'=>0,'haha'=>0];

        $prev = $reactedBy[$studentNo] ?? null;
        if ($prev === $emoji) {
            // toggle off
            unset($reactedBy[$studentNo]);
            $reactions[$emoji] = max(0, ($reactions[$emoji] ?? 0) - 1);
        } else {
            if ($prev) {
                $reactions[$prev] = max(0, ($reactions[$prev] ?? 0) - 1);
            }
            $reactedBy[$studentNo] = $emoji;
            $reactions[$emoji] = ($reactions[$emoji] ?? 0) + 1;
        }

        $ann->reacted_by = $reactedBy;
        $ann->reactions  = $reactions;
        $ann->save();

        return response()->json(['success' => true, 'reactions' => $reactions, 'my_reaction' => $reactedBy[$studentNo] ?? null]);
    }

    public function comment(Request $request, string $id): JsonResponse
    {
        $studentNo   = $request->get('student_no');
        $studentName = $request->get('student_name', 'Öğrenci');
        $text        = trim($request->get('text', ''));

        if (!$text) {
            return response()->json(['success' => false, 'message' => 'Yorum boş olamaz'], 422);
        }

        $ann = Announcement::find($id);
        if (!$ann) return response()->json(['success' => false], 404);

        $comments = $ann->comments ?? [];
        $newComment = [
            'id'         => uniqid(),
            'user_id'    => $studentNo,
            'user_name'  => $studentName,
            'text'       => $text,
            'created_at' => now()->toDateTimeString(),
        ];
        $comments[] = $newComment;
        $ann->comments = $comments;
        $ann->save();

        return response()->json(['success' => true, 'comment' => $newComment, 'total' => count($comments)]);
    }
}
