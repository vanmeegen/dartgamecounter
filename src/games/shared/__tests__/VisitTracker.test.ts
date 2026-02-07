import { describe, expect, test, beforeEach } from "bun:test";
import { VisitTracker } from "../VisitTracker";
import type { Player } from "../../../types";

describe("VisitTracker", () => {
  const players: Player[] = [
    { id: "p1", name: "Player 1" },
    { id: "p2", name: "Player 2" },
  ];

  let tracker: VisitTracker;

  beforeEach(() => {
    tracker = new VisitTracker(players);
  });

  describe("initialization", () => {
    test("starts with first player", () => {
      expect(tracker.getCurrentPlayer().id).toBe("p1");
    });

    test("starts with empty visit", () => {
      expect(tracker.currentVisit.darts).toEqual([]);
      expect(tracker.currentVisit.total).toBe(0);
      expect(tracker.currentVisit.busted).toBe(false);
    });

    test("starts with empty visit history", () => {
      expect(tracker.visitHistory).toEqual([]);
    });

    test("starts at player index 0", () => {
      expect(tracker.currentPlayerIndex).toBe(0);
    });
  });

  describe("addDart", () => {
    test("adds dart to current visit", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      expect(tracker.currentVisit.darts.length).toBe(1);
      expect(tracker.currentVisit.total).toBe(20);
    });

    test("tracks multiple darts in a visit", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.addDart({ segment: 19, multiplier: 1 });
      expect(tracker.currentVisit.darts.length).toBe(2);
      expect(tracker.currentVisit.total).toBe(39);
    });

    test("handles triple multiplier", () => {
      tracker.addDart({ segment: 20, multiplier: 3 });
      expect(tracker.currentVisit.total).toBe(60);
    });

    test("does not add more than 3 darts", () => {
      tracker.addDart({ segment: 1, multiplier: 1 });
      tracker.addDart({ segment: 2, multiplier: 1 });
      tracker.addDart({ segment: 3, multiplier: 1 });
      const result = tracker.addDart({ segment: 4, multiplier: 1 });
      expect(result).toBe(false);
      expect(tracker.currentVisit.darts.length).toBe(3);
    });

    test("returns true when dart is added", () => {
      expect(tracker.addDart({ segment: 20, multiplier: 1 })).toBe(true);
    });
  });

  describe("endVisit", () => {
    test("saves visit to history", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.endVisit(false);
      expect(tracker.visitHistory.length).toBe(1);
      expect(tracker.visitHistory[0].playerId).toBe("p1");
    });

    test("advances to next player", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.endVisit(false);
      expect(tracker.getCurrentPlayer().id).toBe("p2");
    });

    test("wraps around to first player", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.endVisit(false);
      tracker.addDart({ segment: 19, multiplier: 1 });
      tracker.endVisit(false);
      expect(tracker.getCurrentPlayer().id).toBe("p1");
    });

    test("resets current visit", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.endVisit(false);
      expect(tracker.currentVisit.darts).toEqual([]);
      expect(tracker.currentVisit.total).toBe(0);
      expect(tracker.currentVisit.busted).toBe(false);
    });

    test("marks visit as busted when flagged", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.endVisit(true);
      expect(tracker.visitHistory[0].visit.busted).toBe(true);
    });

    test("does not advance player when skipAdvance is true", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.endVisit(false, true);
      expect(tracker.getCurrentPlayer().id).toBe("p1");
    });
  });

  describe("isVisitComplete", () => {
    test("returns false with 0 darts", () => {
      expect(tracker.isVisitComplete()).toBe(false);
    });

    test("returns false with 1 dart", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      expect(tracker.isVisitComplete()).toBe(false);
    });

    test("returns false with 2 darts", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.addDart({ segment: 19, multiplier: 1 });
      expect(tracker.isVisitComplete()).toBe(false);
    });

    test("returns true with 3 darts", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.addDart({ segment: 19, multiplier: 1 });
      tracker.addDart({ segment: 18, multiplier: 1 });
      expect(tracker.isVisitComplete()).toBe(true);
    });
  });

  describe("dartsRemaining", () => {
    test("returns 3 at start of visit", () => {
      expect(tracker.dartsRemaining()).toBe(3);
    });

    test("returns 2 after 1 dart", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      expect(tracker.dartsRemaining()).toBe(2);
    });

    test("returns 0 after 3 darts", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.addDart({ segment: 19, multiplier: 1 });
      tracker.addDart({ segment: 18, multiplier: 1 });
      expect(tracker.dartsRemaining()).toBe(0);
    });
  });

  describe("undoLastDart", () => {
    test("removes the last dart from current visit", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.addDart({ segment: 19, multiplier: 1 });
      const removed = tracker.undoLastDart();
      expect(removed).not.toBeNull();
      expect(removed?.segment).toBe(19);
      expect(tracker.currentVisit.darts.length).toBe(1);
    });

    test("updates total when removing dart", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.addDart({ segment: 19, multiplier: 1 });
      tracker.undoLastDart();
      expect(tracker.currentVisit.total).toBe(20);
    });

    test("returns null when visit is empty", () => {
      expect(tracker.undoLastDart()).toBeNull();
    });
  });

  describe("undoPreviousVisit", () => {
    test("restores previous visit with darts minus last", () => {
      // Complete a full visit
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.addDart({ segment: 19, multiplier: 1 });
      tracker.addDart({ segment: 18, multiplier: 1 });
      tracker.endVisit(false);

      // Now undo back into that visit
      const result = tracker.undoPreviousVisit();
      expect(result).not.toBeNull();
      expect(result?.playerId).toBe("p1");
      // Current player should be back to p1
      expect(tracker.getCurrentPlayer().id).toBe("p1");
      // Visit should have 2 darts (3 minus the undone one)
      expect(tracker.currentVisit.darts.length).toBe(2);
    });

    test("returns null when no history", () => {
      expect(tracker.undoPreviousVisit()).toBeNull();
    });

    test("removes the visit from history", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.endVisit(false);
      tracker.undoPreviousVisit();
      expect(tracker.visitHistory.length).toBe(0);
    });
  });

  describe("resetVisit", () => {
    test("clears current visit without saving to history", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.addDart({ segment: 19, multiplier: 1 });
      tracker.resetVisit();
      expect(tracker.currentVisit.darts).toEqual([]);
      expect(tracker.currentVisit.total).toBe(0);
      expect(tracker.visitHistory.length).toBe(0);
    });
  });

  describe("resetAll", () => {
    test("resets tracker to initial state", () => {
      tracker.addDart({ segment: 20, multiplier: 1 });
      tracker.endVisit(false);
      tracker.addDart({ segment: 19, multiplier: 1 });
      tracker.resetAll(0);
      expect(tracker.currentVisit.darts).toEqual([]);
      expect(tracker.visitHistory).toEqual([]);
      expect(tracker.currentPlayerIndex).toBe(0);
    });

    test("accepts custom starting player index", () => {
      tracker.resetAll(1);
      expect(tracker.getCurrentPlayer().id).toBe("p2");
    });
  });
});
